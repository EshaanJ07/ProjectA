from fastapi import FastAPI
from logic import create_game, update_game
from schemas import Game, AnswerRequest

app = FastAPI()

games: dict[str, Game] = {}

@app.get("/", response_model=dict)
def root() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}

@app.post("/create-game", response_model=Game)
def create_game_route():
    """Endpoint that creates a new game and returns its state."""
    new_game = create_game()
    
    games[new_game.game_id] = new_game

    return new_game


@app.post("/answer", response_model=Game)
def process_answer_route(request: AnswerRequest) -> Game:
    """Processes user's payload answer and updates the game state accordingly."""
    updated_game = update_game(request.answer, games[request.game_id])

    return updated_game







