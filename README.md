# 🎮 Steam GameFinder

> **AI-powered semantic game recommendation engine for Steam**

Steam GameFinder lets users discover Steam games using **natural language**, not rigid filters or keyword-only search.
Describe the *vibe* you want — _“cozy pixel-art farming sim”_, _“dark fantasy open-world RPG”_, or _“story-driven cyberpunk game”_ — and the system finds games that genuinely match your intent.

Built with **semantic embeddings**, **vector search**, and an **AI reasoning layer**.

---

## 🌐 Live Demo

- **Frontend:** https://<your-frontend>.vercel.app  
- **Backend API:** https://<your-space>.hf.space/docs  

---

## ✨ Features

- 🧠 **Natural language search**
  - Search games by mood, genre, mechanics, or theme.

- 🔎 **Semantic recommendations**
  - Uses `intfloat/multilingual-e5-large` embeddings for high-quality similarity matching.

- 🤖 **AI explanation assistant**
  - Explains *why* a game was recommended using an LLM reasoning layer.

- 🖼️ **Rich game cards**
  - Genres, tags, ratings, price, screenshots, and trailers.

- ⚡ **Hybrid ranking engine**
  - Combines semantic similarity, popularity, quality signals, and fuzzy title matching.

- ☁️ **Production-ready deployment**
  - Frontend on Vercel, backend on Hugging Face Spaces, vector database on Pinecone.

---

## 🧱 Tech Stack

### Frontend
- Next.js
- React + TypeScript
- Tailwind CSS / shadcn UI
- Deployed on **Vercel**

### Backend
- FastAPI
- Uvicorn
- Deployed on **Hugging Face Spaces (Docker)**

### ML / AI
- sentence-transformers
- `intfloat/multilingual-e5-large`
- Groq (LLM-based intent extraction & explanations)

### Vector Store
- Pinecone (cosine similarity + hybrid reranking)

---

## 🧠 System Architecture

```
User Query
   ↓
LLM Intent & Tag Extraction
   ↓
Semantic Embedding (E5)
   ↓
Pinecone Vector Search
   ↓
Hybrid Reranking
   ↓
AI Explanation Layer
   ↓
Frontend UI
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (LTS)
- Python 3.11+
- pip
- Pinecone account
- Hugging Face account
- Groq API key

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/steam-games-recommender.git
cd steam-games-recommender
```

---

### 2️⃣ Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
GROQ_API_KEY=your_groq_key
HUGGINGFACE_TOKEN=your_hf_token
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
```

Run the backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs will be available at:
http://localhost:8000/docs

---

### 3️⃣ Frontend Setup (Next.js)

```bash
cd ../frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the dev server:

```bash
npm run dev
```

Open:
http://localhost:3000

---

## ☁️ Deployment

### Frontend (Vercel)

1. Push the repository to GitHub  
2. Import the project into Vercel  
3. Set the environment variable:

```env
NEXT_PUBLIC_API_URL=https://<your-space>.hf.space
```

4. Deploy 🚀

---

### Backend (Hugging Face Spaces – Docker)

Create a **Docker Space** and add the following files.

#### `Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

Add secrets in **Spaces → Variables & secrets**:

- GROQ_API_KEY
- HUGGINGFACE_TOKEN
- PINECONE_API_KEY
- PINECONE_INDEX_NAME

---

## 🔌 API Overview

### `GET /`
Health check

```json
{ "status": "Backend is running 🚀" }
```

---

### `POST /recommend`

```json
{
  "query": "open world rpg with great story",
  "top_k": 32,
  "exclude_ids": []
}
```

Returns a ranked list of recommended games.

---

### `POST /chat`

```json
{
  "message": "Why did you recommend The Witcher 3?",
  "history": []
}
```

Returns an AI-generated explanation.

---

## 🛣️ Roadmap

- Game detail pages with deeper analytics
- User accounts and saved favourites
- Personalised recommendations
- Multilingual support
- Offline evaluation metrics

---

## ⚠️ Disclaimer

Steam data, images, and trademarks belong to their respective owners.  
This project is for **educational and demonstrational purposes only**.

---

⭐ If you like this project, consider starring the repository!
