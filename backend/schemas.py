from pydantic import BaseModel, Field


class Game(BaseModel):
    game_id: str
    lives: int
    score: int
    current_note: str
    seen_notes: set[str] = Field(default_factory=set) #Searching if a note has been seen for O(1) time complexity
    seen_order: list[str] = Field(default_factory=list) #Maintaining game order while ability to pick a random note


class AnswerRequest(BaseModel):
    game_id: str
    answer: str
