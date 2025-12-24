import os
import math
import json
import ast
import re
import numpy as np
from typing import List, Dict, Set
from dotenv import load_dotenv
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from groq import Groq
from rapidfuzz import fuzz

load_dotenv()

# --- Configuration ---
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME", "steam-games-index"))
NAMESPACE = os.getenv("PINECONE_NAMESPACE", "games")

embedder = SentenceTransformer("intfloat/multilingual-e5-large")
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# --- Helper Functions ---

def safe_split(text: str) -> List[str]:
    if not text:
        return []
    return [t.strip() for t in text.split(",") if t.strip()]

def normalize_token(t: str) -> str:
    """Aggressive normalization for search matching"""
    return re.sub(r'[^a-z0-9]', '', t.lower())

def text_to_tokens(text: str) -> Set[str]:
    if not text:
        return set()
    return {normalize_token(t) for t in text.split() if len(t) > 2}

# --- Advanced Tag Logic ---

TAG_SYNONYMS: Dict[str, List[str]] = {
    "cozy": ["relaxing", "chill", "peaceful", "calm", "wholesome", "casual"],
    "farming": ["agriculture", "crops", "harvest", "farm", "garden"],
    "combat": ["shooter", "fighting", "battle", "fps", "action", "war"],
    "rpg": ["roleplay", "role-playing", "character customization", "story"],
    "survival": ["survive", "surviving", "scavenge", "crafting"],
    "cute": ["adorable", "kawaii", "charming"],
    "tactical": ["strategy", "strategic", "planning", "rts", "turn-based"],
    "fps": ["first-person shooter", "shooter", "gun", "military"],
    "horror": ["scary", "spooky", "zombie", "gore", "psychological"],
}

def expand_tags(tags: List[str]) -> Set[str]:
    expanded = set(tags)
    for tag in tags:
        norm_tag = tag.lower().strip()
        if norm_tag in TAG_SYNONYMS:
            expanded.update(TAG_SYNONYMS[norm_tag])
    return expanded

NEGATIVE_TAGS: Dict[str, List[str]] = {
    "training": ["aim", "trainer", "practice", "training", "tutorial"],
    "software": ["benchmark", "utility", "software", "design"],
    "dlc": ["soundtrack", "artbook", "season pass", "expansion"], # Try to avoid non-games
}

def calculate_negative_penalty(game_token_set: Set[str]) -> float:
    penalty = 0.0
    for neg_list in NEGATIVE_TAGS.values():
        matches = [t for t in neg_list if normalize_token(t) in game_token_set]
        if len(matches) >= 1:
            penalty -= 15.0 # Stronger penalty to hide non-games
    return penalty

def format_game(match):
    """Formats Pinecone match into clean JSON."""
    md = match.metadata
    genres = safe_split(md.get("genres", ""))
    tags = safe_split(md.get("tags", ""))

    raw_screens = md.get("screenshots", "[]")
    screenshots = []
    try:
        if isinstance(raw_screens, list):
            screenshots = raw_screens
        elif isinstance(raw_screens, str):
            try:
                if raw_screens.strip().startswith("["):
                    screenshots = ast.literal_eval(raw_screens)
                else:
                    screenshots = [s.strip() for s in raw_screens.split(",") if s.strip()]
            except (ValueError, SyntaxError):
                clean_str = raw_screens.strip("[]").replace("'", "").replace('"', "")
                screenshots = [s.strip() for s in clean_str.split(",") if s.strip()]
    except Exception:
        screenshots = []

    screenshots = [s for s in screenshots if isinstance(s, str) and s.startswith("http")]

    return {
        "id": match.id,
        "title": md.get("title", "Unknown"),
        "description": md.get("description", ""),
        "genres": genres,
        "tags": tags,
        "price": md.get("price", "0"),
        "image": md.get("image", ""),
        "score": match.score,
        "reviews": int(float(md.get("reviews", 0))),
        "positive_ratio": float(md.get("positive_ratio", 0)),
        "metacritic": int(float(md.get("metacritic", 0))),
        "release_date": md.get("release_date", ""),
        "screenshots": screenshots,
        "trailer": md.get("trailer", ""),
    }

def generate_tags_from_groq(user_query: str) -> List[str]:
    """Uses LLM to extract intent tokens (Genre, Mood, Mechanics)."""
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Extract 5-8 relevant tags from the user query. "
                        "If the user searches for a specific game title (e.g. 'Elden Ring'), return tags describing that game.\n"
                        "Return JSON: {\"tags\": [\"tag1\", ...]}"
                    ),
                },
                {"role": "user", "content": user_query},
            ],
            temperature=0.1,
            max_tokens=100,
            response_format={"type": "json_object"},
        )
        data = json.loads(completion.choices[0].message.content)
        return [t.lower().replace(" ", "") for t in data.get("tags", [])]
    except Exception:
        return [t for t in user_query.lower().split() if len(t) > 3]

# --- CORE SEARCH LOGIC ---

def search_games(query: str, top_k: int = 12, exclude_ids: List[str] | None = None):
    # 1. PRE-PROCESSING
    # Detect if query looks like a specific title search vs a generic recommendation
    # (Heuristic: Short queries or queries with capitalized words often imply titles)
    is_specific_search = len(query.split()) < 5
    
    # Generate Semantic Tags via LLM
    groq_tags = generate_tags_from_groq(query)
    expanded_tags = expand_tags(groq_tags)
    
    # Tokenize query for lexical matching
    query_tokens = text_to_tokens(query)
    normalized_query = normalize_token(query)

    print(f"🔍 Intent: {'Specific Title' if is_specific_search else 'Recommendation'}")
    print(f"🏷️  Tags: {list(expanded_tags)[:5]}")

    # 2. VECTOR SEARCH (Semantic Layer)
    # We prefix with "query:" for E5 models to perform retrieval
    vector_query = f"query: {query}"
    vector = embedder.encode(vector_query).tolist()

    # Fetch more candidates to allow for re-ranking
    results = index.query(
        vector=vector,
        top_k=200, 
        namespace=NAMESPACE,
        include_metadata=True,
    )

    matches = results.matches
    if exclude_ids:
        matches = [m for m in matches if m.id not in exclude_ids]

    scored_results = []

    # 3. HYBRID SCORING LOOP
    for m in matches:
        md = m.metadata
        title = md.get("title", "Unknown")
        normalized_title = normalize_token(title)
        
        # --- A. Exact/Fuzzy Title Matching (Search Engine Logic) ---
        # This is crucial for "Call of Duty" to actually show Call of Duty
        title_score = 0.0
        
        # 1. Exact token match
        if normalized_query in normalized_title:
            title_score += 40.0 # Huge boost for substring match
        
        # 2. Fuzzy Ratio (Handles typos: "Elden Ring" vs "Eldn Ring")
        fuzz_ratio = fuzz.ratio(normalized_query, normalized_title)
        if fuzz_ratio > 85:
            title_score += 30.0
        elif fuzz_ratio > 60:
            title_score += 10.0

        # --- B. Popularity & Quality (Trust Signal) ---
        try:
            reviews = int(float(md.get("reviews", 0)))
            positive_ratio = float(md.get("positive_ratio", 0))
            metacritic = int(float(md.get("metacritic", 0)))
        except:
            reviews, positive_ratio, metacritic = 0, 0, 0

        # Logarithmic scale for reviews (100k reviews isn't 10x better than 10k, maybe 2x)
        pop_score = math.log10(reviews + 1) * 3.0
        
        # Quality multiplier
        quality_mult = 1.0
        if metacritic > 85: quality_mult = 1.3
        elif positive_ratio > 0.90: quality_mult = 1.2
        
        # --- C. Vector Similarity (Vibe Check) ---
        # E5 scores usually range 0.7 to 0.85 for relevant items.
        # We normalize this to a 0-100 scale roughly.
        vector_score = (m.score - 0.7) * 200.0 
        
        # --- D. Tag/Genre Overlap ---
        game_tags_text = (md.get("tags", "") or "") + " " + (md.get("genres", "") or "")
        game_token_set = text_to_tokens(game_tags_text)
        
        # Count how many LLM-generated tags appear in the game's tags
        tag_match_count = len(expanded_tags & game_token_set)
        tag_score = tag_match_count * 5.0

        # --- E. Penalties ---
        neg_penalty = calculate_negative_penalty(game_token_set)

        # --- FINAL SCORE COMPOSITION ---
        if is_specific_search:
            # If user types a name, Title Match is King
            final_score = (title_score * 3.0) + (vector_score * 0.5) + (pop_score * 0.5) + neg_penalty
        else:
            # If user types "fun fps game", Vibe & Popularity matter more
            final_score = (vector_score * 1.5) + tag_score + pop_score + (quality_mult * 10) + neg_penalty

        scored_results.append({
            **format_game(m),
            "final_score": round(final_score, 2),
            "debug": {
                "title_score": title_score,
                "vec_raw": round(m.score, 3),
                "pop_score": round(pop_score, 1),
                "tag_hits": tag_match_count
            }
        })

    # 4. RE-RANKING & DIVERSIFICATION
    scored_results.sort(key=lambda x: x["final_score"], reverse=True)
    
    # Optional: Deduplication by title (some steam games have dupes)
    seen_titles = set()
    unique_results = []
    for res in scored_results:
        norm_t = normalize_token(res['title'])
        if norm_t not in seen_titles:
            unique_results.append(res)
            seen_titles.add(norm_t)
        if len(unique_results) >= top_k:
            break

    return unique_results
