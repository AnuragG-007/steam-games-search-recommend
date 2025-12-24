
# 🎮 Steam GameFinder

> **AI-powered semantic game discovery and intelligent recommendation system for Steam**

Steam GameFinder is an **end-to-end AI-driven game discovery system** that allows users to find Steam games using **natural language intent** instead of rigid filters or keyword-based search.

Rather than forcing users to manually select genres, tags, or popularity thresholds, the system understands *what the user wants to play* based on intent, mood, mechanics, and themes.

Examples of supported queries:
- “cozy pixel-art farming sim with relaxing vibes”
- “dark fantasy open-world RPG with deep lore”
- “story-rich cyberpunk game with strong characters”

The project is designed to reflect **real-world recommendation system engineering**, focusing on:
- semantic understanding
- high-quality ranking
- logical consistency
- scalable system design

---

## ✨ Core Capabilities

- 🧠 **Natural Language Intent Understanding**  
  Extracts user intent, mood, genre preferences, and gameplay mechanics from free-form queries using LLM-assisted parsing.

- 🔎 **Semantic Retrieval (Beyond Keywords)**  
  Dense embeddings capture contextual meaning rather than relying on surface-level keyword overlap.

- ⚡ **Production-Style Hybrid Ranking Engine**  
  Combines semantic relevance with popularity, quality metrics, fuzzy title matching, and negative penalties to produce stable, high-quality recommendations.

- 🤖 **Reasoned Recommendation Logic**  
  Every recommendation is backed by structured reasoning at the backend level, enabling explainability, debugging, and trust in the ranking pipeline.

- 🧩 **Modular, Extensible Architecture**  
  Clear separation of concerns allows independent evolution of ML, ranking logic, APIs, and frontend layers.

---

## 🧠 What Makes This Project Different (Engineering Highlights)

This project intentionally avoids being a “toy LLM demo” and instead mirrors **practical recommendation systems used in production environments**.

- **Semantic search is not the final answer**  
  Vector similarity is treated as a *candidate generation step*, followed by a carefully weighted re-ranking pipeline.

- **Signal engineering over raw model output**  
  Engineered features such as review ratios, popularity heuristics, quality scores, and exclusion penalties significantly improve result quality and robustness.

- **Explainability-first mindset**  
  Although explanations are not directly surfaced in the UI, every result is accompanied by backend-level reasoning — a critical requirement for trustworthy AI systems.

- **Scalability-aware design decisions**  
  Indexing only the top 5,000 high-signal games balances relevance, cost, latency, and ranking stability.

- **End-to-end system ownership**  
  Covers dataset processing, embedding strategy, vector indexing, ranking logic, API contracts, deployment, and frontend integration — reflecting full project ownership.

---

## 🧱 Tech Stack

### Backend & ML
- **API Framework:** FastAPI  
- **Vector Database:** Pinecone (cosine similarity, serverless)  
- **Embedding Model:** `intfloat/multilingual-e5-large`  
- **LLM Inference:** Groq (LLaMA 3.1)  
- **Deployment:** Hugging Face Spaces (Docker)

### Frontend
- **Initial UI Scaffold:** v0.dev  
- **Customization:** Manual UI refinement aligned with backend APIs and response structure  
- **Focus:** Dynamic data-driven components, API consumption, and interaction design

> The project emphasizes **system design and integration**, not just isolated ML components.

---

## 🧠 High-Level Architecture

```
User Query (JSON)
   ↓
LLM-based Intent & Tag Extraction
   ↓
Semantic Embedding Generation (E5)
   ↓
Candidate Retrieval (Pinecone)
   ↓
Hybrid Re-ranking Engine
   ↓
Reasoned Recommendation Output
   ↓
Structured JSON Response
```

---

## 🌲 Vector Database & Indexing Pipeline

### Dataset
- **Source:** FronkonGames/steam-games-dataset (Hugging Face)

Each entry represents a Steam game with metadata such as genres, tags, reviews, ownership estimates, and external ratings.

### Data Processing & Feature Engineering
For each game:
- Text cleaning and normalization (ASCII-safe)
- Truncation of long descriptions
- Structured parsing of genres, tags, and categories
- Derived ranking signals:
  - `reviews = positive + negative`
  - `positive_ratio = positive / total`
  - `popularity = owners + reviews * 5 + metacritic * 1000`

To maintain **ranking quality and system performance**, only the **top 5,000 games by popularity** are indexed.

---

## 🧠 Embedding Strategy

- **Model:** `intfloat/multilingual-e5-large`  
- **Vector Dimension:** 1024  

Best-practice formatting:

```
passage: Game <title>.
Genres: <genres>.
Tags: <tags>.
Description: <description>.
```

Query-time embedding:
```
query: <user query>
```

This ensures strong semantic alignment between user intent and indexed content.

---

## 🔎 Recommendation Engine

### 1️⃣ Intent Extraction
- LLaMA 3.1 extracts 5–8 high-level semantic tags
- Synonym expansion improves recall (e.g., *cozy → relaxing, chill*)

### 2️⃣ Candidate Retrieval
- Top semantic matches retrieved from Pinecone

### 3️⃣ Hybrid Re-ranking
Each candidate is scored using:
- Semantic similarity
- Exact + fuzzy title matching
- Popularity (log-scaled)
- Quality metrics (Metacritic, positive review ratio)
- Tag overlap
- Negative penalties (DLCs, trainers, non-game entries)

Different weighting strategies are applied for:
- **Exploratory discovery queries**
- **Specific title searches**

---

## 🤖 Conversational Assistant

A conversational endpoint supports:
- Follow-up queries and clarifications
- Comparative questions between games
- Reasoned natural-language explanations

This component reinforces trust and transparency in the recommendation pipeline.

---

## 🔌 API Example

### `POST /recommend`

```json
{
  "query": "open world rpg with great story",
  "top_k": 12
}
```

---

## 🚀 Local Development

```bash
uvicorn app.main:app --reload --port 8000
```

---

## 🛣️ Future Improvements

- Personalized recommendations using user profiles
- Offline ranking evaluation and metrics
- Multilingual discovery support
- A/B testing of ranking strategies
- Advanced frontend explorations

---

## ⚠️ Disclaimer

Steam data, images, and trademarks belong to their respective owners.  
This project is intended for **educational, research, and portfolio purposes**.

---

⭐ If you find this project useful, consider starring the repository!
