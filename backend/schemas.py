from pydantic import BaseModel, Field

class Game(BaseModel):
    game_id: str
    lives: int
    score: int
    current_note: str
    seen_notes: list[str] = Field(default_factory=list)

class AnswerRequest(BaseModel):
    game_id: str
    answer: str



