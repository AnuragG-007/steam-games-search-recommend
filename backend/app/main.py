from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.services import search_games
from app.chat import generate_game_answer
from app.schemas import QueryRequest, GameResponse, ChatRequest, ChatResponse

app = FastAPI(title="Steam GameFinder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Backend is running 🚀"}

@app.post("/recommend", response_model=list[GameResponse])
def recommend(req: QueryRequest):
    try:
        games = search_games(
            req.query,
            top_k=req.top_k,
            exclude_ids=req.exclude_ids,
        )
        return games
    except Exception as e:
        print(f"/recommend error: {e}")
        raise HTTPException(status_code=500, detail="Recommendation failed")

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        answer = generate_game_answer(
            user_message=req.message,
            history=req.history or []
        )

        return ChatResponse(
            answer=answer,
            related_games=[]
        )

    except Exception as e:
        print(f"❌ Error in /chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

