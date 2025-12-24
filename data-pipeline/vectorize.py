import os
import re
import time
import ast
from dotenv import load_dotenv
from datasets import load_dataset
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
from tqdm.auto import tqdm
import torch

# --- CONFIG ---
load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "steam-games-index")
NAMESPACE = os.getenv("PINECONE_NAMESPACE", "games")

MODEL_NAME = "intfloat/multilingual-e5-large"
DIMENSION = 1024
MAX_GAMES_TO_INDEX = 5000

# --- HELPERS ---
def safe_ascii(text):
    if not isinstance(text, str):
        return str(text)
    return (
        text.replace("—", "-")
        .replace("–", "-")
        .replace("“", '"')
        .replace("”", '"')
        .replace("’", "'")
        .encode("ascii", "ignore")
        .decode("ascii")
    )

def parse_owners(val):
    if not isinstance(val, str):
        return 0
    nums = re.findall(r"[\d,]+", val)
    return max((int(n.replace(",", "")) for n in nums), default=0)

def clean_list(val):
    if not val:
        return []
    s = str(val).strip()
    if s.startswith("[") and s.endswith("]"):
        try:
            return ast.literal_eval(s)
        except:
            pass
    return [v.strip() for v in s.split(",") if v.strip()]

def clean_text(text):
    return str(text).replace("\n", " ").strip()[:1500] if text else ""

def positive_ratio(pos, neg):
    total = pos + neg
    return round(pos / total, 2) if total else 0.0

# --- LOAD DATA ---
print("⬇️ Loading Steam dataset...")
dataset = load_dataset("FronkonGames/steam-games-dataset", split="train")

print("🧹 Processing data...")
games = []

for row in tqdm(dataset):
    try:
        pos = int(row.get("Positive", 0))
        neg = int(row.get("Negative", 0))
        owners = parse_owners(row.get("Estimated owners", "0"))
        reviews = pos + neg
        metacritic = int(row.get("Metacritic score", 0))

        popularity = owners + reviews * 5 + metacritic * 1000

        games.append({
            "id": str(row["AppID"]),
            "title": str(row.get("Name", "Unknown")),
            "description": clean_text(row.get("About the game", "")),
            "genres": ", ".join(clean_list(row.get("Genres"))),
            "tags": ", ".join(clean_list(row.get("Tags"))[:25]),
            "categories": ", ".join(clean_list(row.get("Categories"))),
            "owners": owners,
            "reviews": reviews,
            "positive_ratio": positive_ratio(pos, neg),
            "price": str(row.get("Price", 0)),
            "image": str(row.get("Header image", "")),
            "release_date": str(row.get("Release date", "")),
            "metacritic": metacritic,
            "screenshots": str(row.get("Screenshots", "")),
            "trailer": str(row.get("Movies", "")),
            "popularity": popularity
        })
    except:
        continue

games.sort(key=lambda g: g["popularity"], reverse=True)
games = games[:MAX_GAMES_TO_INDEX]

print(f"🏆 Indexing top {len(games)} games")

# --- EMBEDDINGS ---
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🧠 Loading embedding model on {device.upper()}")

model = SentenceTransformer(MODEL_NAME, device=device)

texts = [
    f"passage: Game {g['title']}. Genres: {g['genres']}. Tags: {g['tags']}. Description: {g['description']}"
    for g in games
]

print("⚡ Generating embeddings...")
embeddings = model.encode(
    texts,
    batch_size=64 if device == "cuda" else 16,
    show_progress_bar=True
)

# --- PINECONE ---
print("🌲 Connecting to Pinecone...")
pc = Pinecone(api_key=PINECONE_API_KEY)

if INDEX_NAME in pc.list_indexes().names():
    print(f"🗑️ Deleting existing index {INDEX_NAME}")
    pc.delete_index(INDEX_NAME)
    time.sleep(15)

print(f"🔨 Creating index {INDEX_NAME}")
pc.create_index(
    name=INDEX_NAME,
    dimension=DIMENSION,
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
)

index = pc.Index(INDEX_NAME)

# --- UPSERT ---
print("🚀 Uploading vectors...")
batch_size = 100

for i in tqdm(range(0, len(games), batch_size)):
    batch_games = games[i:i + batch_size]
    batch_embeds = embeddings[i:i + batch_size]

    vectors = []
    for j, g in enumerate(batch_games):
        meta = {k: safe_ascii(v) for k, v in g.items() if k != "popularity"}
        vectors.append({
            "id": g["id"],
            "values": batch_embeds[j].tolist(),
            "metadata": meta
        })

    index.upsert(vectors=vectors, namespace=NAMESPACE)

print("✅ Pinecone index ready!")
