from pydantic import BaseModel
from typing import List, Optional, Union

class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 12
    exclude_ids: Optional[List[str]] = []

class GameResponse(BaseModel):
    id: str
    title: str
    description: str
    genres: List[str]          
    tags: List[str] 
    price: Union[str, float]
    image: str
    score: float
    reviews: int
    positive_ratio: float
    metacritic: int 
    release_date: str
    screenshots: List[str]
    trailer: str

class ChatRequest(BaseModel):
    message: str 
    history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    answer: str
    related_games: Optional[List[GameResponse]] = []
