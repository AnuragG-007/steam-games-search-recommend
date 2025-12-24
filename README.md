🎮 Steam GameFinder
AI-powered game recommendation engine for Steam.
Frontend: Next.js (Vercel) - Backend: FastAPI + Sentence Transformers (Hugging Face Spaces).
​

Live demo: https://<your-frontend>.vercel.app

✨ Features
Natural language search for Steam games (e.g. "cozy pixel-art farming sim").

Semantic embeddings using intfloat/multilingual-e5-large for high-quality recommendations.
​

AI chat assistant that explains why each game fits your vibe.

Rich game cards with tags, ratings, price, screenshots and trailers.

Deployed frontend on Vercel and backend on Hugging Face Spaces.
​

🧱 Tech Stack
Frontend: Next.js, React, TypeScript, Tailwind CSS / shadcn UI.
​

Backend: FastAPI, Uvicorn.
​

ML / AI: sentence-transformers, intfloat/multilingual-e5-large for embeddings.
​

Vector store: Pinecone.
​

Infra: Vercel (frontend), Hugging Face Spaces (backend).
​

🚀 Getting Started (Local)
Prerequisites
Node.js (LTS)

Python 3.11+

pip

A Hugging Face account and access to intfloat/multilingual-e5-large.
​

1. Clone the repo
bash
git clone https://github.com/<your-username>/steam-games-recommender.git
cd steam-games-recommender
2. Backend setup
bash
cd backend
python -m venv .venv
# Windows:
# .venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt
Create a .env file in backend/:

text
GROQ_API_KEY=your_groq_key
HUGGINGFACE_TOKEN=your_hf_token
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
PINECONE_ENVIRONMENT=your_region
Run the backend locally:

bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Open http://localhost:8000/docs to explore the API.

3. Frontend setup
bash
cd ../frontend
npm install
Create .env.local in frontend/:

text
NEXT_PUBLIC_API_URL=http://localhost:8000
Run the dev server:

bash
npm run dev
Open http://localhost:3000 to use the app.

☁️ Deployment
Frontend (Vercel)
​
Push the repo to GitHub.

Import the project into Vercel.

Set environment variables:

text
NEXT_PUBLIC_API_URL=https://<your-space>.hf.space
Deploy.

Backend (Hugging Face Spaces – Docker)
​
Create a new Space:

Type: Docker

Name: steam-backend

Copy the contents of your backend/ folder into the Space repo.

Add a README.md with this front matter:

text
---
title: steam-backend
sdk: docker
app_port: 7860
---
Add a Dockerfile:

text
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
In the Space settings, add your secrets under “Variables & secrets”:

GROQ_API_KEY

HUGGINGFACE_TOKEN

PINECONE_API_KEY

PINECONE_INDEX_NAME

Any other keys used by your backend

Spaces will expose them as environment variables inside the container.
​

🔌 API Overview
Base URL (local): http://localhost:8000
Base URL (prod): https://<your-space>.hf.space

GET /
Health check.

Response:

json
{ "status": "Backend is running 🚀" }
POST /recommend
Body:

json
{
  "query": "open world rpg with great story",
  "top_k": 64,
  "exclude_ids": []
}
Response: list of game objects:

json
[
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
]
POST /chat
Body:

json
{
  "message": "Why did you recommend Witcher 3?",
  "history": []
}
Response:

json
{
  "answer": "The Witcher 3 matches your request for a story-rich open world RPG because ...",
  "related_games": []
}
📌 Roadmap
Game detail page with more in-depth analytics.

User accounts with saved favourites and play history.

More languages and personalization for recommendations.

🙏 Credits
Embedding model: intfloat/multilingual-e5-large on Hugging Face.
​

Inspiration and general README structure based on popular GitHub README templates.
​

Steam data and images belong to their respective owners; used here for educational/demo purposes.
