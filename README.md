# 🎮 Steam GameFinder

> **AI-powered semantic game recommendation engine for Steam**

Steam GameFinder is a **backend-first, AI-powered game discovery system** for Steam.  
Instead of relying on rigid filters or keyword search, it allows users to discover games using **natural language intent** such as:

- “cozy pixel-art farming sim”
- “dark fantasy open-world RPG”
- “story-rich cyberpunk game”

The backend focuses on **semantic understanding, ranking quality, and explainability**, while leaving **UI/UX design fully flexible** for frontend developers.

---

## 🌐 Live API

- **Backend API (Swagger UI):** https://<your-space>.hf.space/docs  

---

## ✨ Core Capabilities

- 🧠 **Natural language understanding**
  - Interprets user intent, mood, genre, and mechanics.

- 🔎 **Semantic recommendations**
  - Uses high-quality E5 embeddings for similarity search.

- ⚡ **Hybrid ranking engine**
  - Combines semantic relevance, popularity, quality signals, and fuzzy title matching.

- 🤖 **AI explanation layer**
  - Explains *why* a game matches the user’s query.

- 📦 **Backend-first design**
  - Clean JSON contracts make it easy to build any UI on top.

---

## 🧱 Tech Stack (Backend & ML)

- **API Framework:** FastAPI
- **Vector Search:** Pinecone (cosine similarity, serverless)
- **Embeddings:** `intfloat/multilingual-e5-large`
- **LLM Provider:** Groq (LLaMA 3.1)
- **Deployment:** Hugging Face Spaces (Docker)

---

## 🧠 High-Level Architecture

```
User Query (JSON)
   ↓
LLM Intent & Tag Extraction
   ↓
Semantic Embedding (E5)
   ↓
Pinecone Vector Search
   ↓
Hybrid Re-ranking
   ↓
AI Explanation Layer
   ↓
JSON Response
```

---

## 🌲 Pinecone Vector Database (Indexing Pipeline)

### Dataset
- **Source:** FronkonGames/steam-games-dataset (Hugging Face)
- Each entry represents a Steam app with metadata, tags, genres, reviews, and media.

### Data Processing & Feature Engineering
For each game:
- Clean and normalize text (ASCII-safe)
- Truncate long descriptions
- Parse list-like fields (genres, tags, categories)
- Compute derived signals:
  - `reviews = positive + negative`
  - `positive_ratio = positive / total`
  - `popularity = owners + reviews * 5 + metacritic * 1000`

Only the **top 5,000 games by popularity** are indexed to maintain relevance and performance.

---

### Embedding Strategy

- Model: `intfloat/multilingual-e5-large`
- Vector dimension: **1024**
- E5 best-practice formatting:

```
passage: Game <title>.
Genres: <genres>.
Tags: <tags>.
Description: <description>.
```

At query time, user input is embedded using:

```
query: <user query>
```

---

### Pinecone Index Configuration

- Metric: cosine similarity
- Type: serverless
- Cloud: AWS (us-east-1)
- Namespace: `games`

Vectors store **semantic meaning only**, while all metadata is stored alongside for ranking and UI usage.

---

## 🔎 Recommendation Engine (Backend Logic)

### 1️⃣ Intent Extraction
- Groq LLM extracts 5–8 semantic tags from the query.
- Tags are expanded using synonym rules (e.g. *cozy → relaxing, chill*).

### 2️⃣ Vector Retrieval
- Top 200 semantic candidates fetched from Pinecone.

### 3️⃣ Hybrid Re-ranking
Each candidate is scored using:
- Semantic similarity
- Exact + fuzzy title matching (typo tolerant)
- Popularity (log-scaled reviews)
- Quality signals (Metacritic, positive ratio)
- Tag overlap
- Negative penalties (DLCs, trainers, non-games)

Different weighting strategies are applied for:
- **Specific title searches**
- **Open-ended recommendations**

---

## 🤖 AI Chat Assistant

The backend exposes a conversational endpoint that:
- Uses LLaMA 3.1 via Groq
- Maintains short-term context (last 10 messages)
- Explains recommendations in natural language
- Supports follow-up questions and comparisons

---

## 🔌 API Contract (Frontend-Friendly)

### `POST /recommend`

**Request**
```json
{
  "query": "open world rpg with great story",
  "top_k": 12,
  "exclude_ids": []
}
```

**Response (example)**
```json
{
  "id": "1091500",
  "title": "Cyberpunk 2077",
  "description": "...",
  "genres": ["RPG", "Open World"],
  "tags": ["Cyberpunk", "Story Rich"],
  "price": 59.99,
  "image": "https://...",
  "score": 0.87,
  "reviews": 123456,
  "positive_ratio": 0.92,
  "metacritic": 86,
  "release_date": "2020-12-10",
  "screenshots": ["https://...", "..."],
  "trailer": "https://..."
}
```

---

### `POST /chat`

**Request**
```json
{
  "message": "Why did you recommend The Witcher 3?",
  "history": []
}
```

**Response**
```json
{
  "answer": "The Witcher 3 matches your request because...",
  "related_games": []
}
```

---

## 🎨 Frontend Integration Philosophy

This project intentionally **does not enforce any frontend stack or design**.

The backend:
- Accepts **clean JSON input**
- Returns **rich, structured JSON output**
- Is fully **UI-agnostic**

You are free to:
- Build a minimal search UI
- Design a rich carousel-based game browser
- Add chat-based discovery
- Experiment with mobile, desktop, or voice interfaces

As long as your frontend respects the API contract, **you can innovate freely**.

---

## 🚀 Local Development

```bash
uvicorn app.main:app --reload --port 8000
```

Swagger UI:
http://localhost:8000/docs

---

## 🛣️ Roadmap

- User profiles & personalization
- Game detail analytics
- Multilingual recommendations
- Offline ranking evaluation
- A/B testing for ranking strategies

---

## ⚠️ Disclaimer

Steam data, images, and trademarks belong to their respective owners.  
This project is for **educational and demonstrational purposes only**.

---

⭐ If you find this project useful, consider starring the repository!
