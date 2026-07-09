from uuid import uuid4
from schemas import Game
import random


NOTE_TYPES = ["C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs", "A", "As", "B"]


def generate_game_notes(octave_start: int, octave_end: int) -> list[str]:
    """Generates the list of notes to be used during a game session, from octave_start to octave_end, inclusive. Note that octave 8 only has the note C8."""

    if octave_end < octave_start:
        raise ValueError("octave_end must be greater than or equal to octave_start")
    elif octave_start < 0 or octave_end < 0 or octave_start > 8 or octave_end > 8:
        raise ValueError("octave_start and octave_end must be integers between 0 and 8")

    notes = []
    for octave in range(octave_start, octave_end + 1):
        if octave == 8:
            notes.append("C8")
            continue
        for note_type in NOTE_TYPES:
            notes.append(f"{note_type}{octave}")

    return notes


ALL_GAME_NOTES = generate_game_notes(1, 8)  # Generates notes from C1 to C8


def create_game() -> Game:
    """Creates a new game."""
    new_game = Game(
        game_id=str(uuid4()),
        lives=3,
        score=0,
        current_note=random.choice(ALL_GAME_NOTES),
    )

    return new_game


def update_game(answer: str, current_game: Game) -> Game:
    """Updating the game state based on user answer."""
    is_new = current_game.current_note not in current_game.seen_notes
    correct_ans = "new" if is_new else "seen"
    
    if answer == correct_ans:
        current_game.score += 1
    else:
        current_game.lives -= 1
        if current_game.lives <= 0:
            return current_game  # Game ends, no new note is generated
    
    if is_new:
        current_game.seen_notes.add(current_game.current_note)
        current_game.seen_order.append(current_game.current_note)
    
    current_game.current_note = get_next_note(current_game)

    return current_game


def get_next_note(current_game: Game) -> str:
    """Generating a new random note with a 50/50 chance of being a seen or unseen note. Requires seen_order to be non-empty."""
    if not current_game.seen_order:
        raise ValueError("seen_order cannot be empty")

    is_next_seen = random.choice([True, False])

    if is_next_seen:
        next_note = random.choice(current_game.seen_order)
    else:
        unseen_notes = [note for note in ALL_GAME_NOTES if note not in current_game.seen_notes]
        next_note = (
            random.choice(unseen_notes)
            if unseen_notes
            else random.choice(current_game.seen_order)
        )
    
    return next_note
