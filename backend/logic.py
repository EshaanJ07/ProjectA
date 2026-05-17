from uuid import uuid4
from schemas import Game
import random


NOTES = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5"]


def create_game() -> Game:
    """Creates a new game."""
    new_game = Game(
        game_id=str(uuid4()),
        lives=3,
        score=0,
        current_note=random.choice(NOTES),
    )

    return new_game


def update_game(answer: str, current_game: Game) -> Game:
    """Updating the game state based on user answer."""
    if current_game.current_note in current_game.seen_notes:
        correct = "seen"
    else:
        correct = "new"
    
    if answer == correct:
        current_game.score += 1
    else:
        current_game.lives -= 1
        if current_game.lives == 0:
            return current_game #Game ends, no new note is generated
    
    current_game.seen_notes.append(current_game.current_note)
    current_game.current_note = get_next_note(current_game)

    return current_game


def get_next_note(current_game: Game) -> str:
    """Generating a new random note with a 50/50 chance of being a seen or unseen note."""
    next_seen = random.choice([True, False])

    if next_seen:
        next_note = random.choice(current_game.seen_notes)
    else:
        seen_notes = set(current_game.seen_notes)
        unseen_notes = [note for note in NOTES if note not in seen_notes]
        next_note = random.choice(unseen_notes) if unseen_notes else random.choice(current_game.seen_notes)
    
    return next_note
        

    
