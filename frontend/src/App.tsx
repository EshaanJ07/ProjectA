import Title from "./components/Title";
import Button from "./components/Button";
import Note from "./components/Note";
import Score from "./components/Score";
import Lives from "./components/Lives";
import { useState } from "react";
import { noteMap } from "./assets/audio/noteMap.ts";

const BASE_URL = "http://127.0.0.1:8000";

let noteAudio: HTMLAudioElement | null = null;
const playNote = (note: keyof typeof noteMap) => {
  noteAudio?.pause();
  noteAudio = noteMap[note];
  noteAudio.currentTime = 0;
  noteAudio.play();
};

const App = () => {
  const [hasGameStarted, setStartGame] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameId, setGameId] = useState("");
  const [score, setScore] = useState(-1);
  const [lives, setLives] = useState(-1);
  const [currentNote, setCurrentNote] = useState("");

  const startGame = async () => {
    setStartGame(true);

    const response = await fetch(`${BASE_URL}/create-game`, { method: "POST" });

    const new_game = await response.json();

    playNote(new_game.current_note);
    setCurrentNote(new_game.current_note);
    setGameId(new_game.game_id);
    setScore(new_game.score);
    setLives(new_game.lives);
  };

  const updateGame = async (decision: "new" | "seen") => {
    const response = await fetch(`${BASE_URL}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: gameId, answer: decision }),
    });

    const updated_game = await response.json();

    if (updated_game.lives === 0) {
      noteAudio?.pause();
      setGameOver(true);
      return;
    }

    playNote(updated_game.current_note);
    setCurrentNote(updated_game.current_note);

    setScore(updated_game.score);
    setLives(updated_game.lives);
  };

  return (
    <div>
      <Title title="Note Recognition Test" />
      {!hasGameStarted && (
        <>
          <Button name="Start Test" onClick={startGame} />
        </>
      )}

      {hasGameStarted && !gameOver && (
        <>
          <Score name="Score" score={score} />
          <Lives count={lives} />
          <Note name={currentNote} />
          <Button name="New" onClick={() => updateGame("new")} />
          <Button name="Seen" onClick={() => updateGame("seen")} />
          <Button name="End Game" onClick={() => setGameOver(true)} />
        </>
      )}

      {gameOver && (
        <>
          <Score name="Final Score" score={score} />
        </>
      )}
    </div>
  );
};

export default App;
