import Title from "./components/Title";
import Button from "./components/Button";
import Note from "./components/Note";
import Score from "./components/Score";
import Lives from "./components/Lives";
import { useState } from "react";
import { noteMap } from "./assets/audio/noteMap.ts";
import playButtonAudio from "./assets/audio/audioEffects.ts";
import Header from "./components/Header.tsx";
import AudioCircle from "./components/AudioCircle.tsx";
import AudioMemoryTitle from "./components/AudioMemoryTitle.tsx";
import Divider from "./components/Divider.tsx";
import GameDescription from "./components/GameDescription.tsx";
import StartButton from "./components/StartButton.tsx";
import Footer from "./components/Footer.tsx";

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
    <>
      <Header />
      <main className="pt-25">
        <div className="mx-2">
          <AudioMemoryTitle />
        </div>
        <Divider />
        <div className="mx-3.5 my-2">
          <GameDescription />
        </div>
        <div className="w-15 mx-3.5">
          <Divider />
        </div>
        <div className="flex-center my-5">
          <AudioCircle />
        </div>
        <div className="flex justify-center">
          <StartButton />
        </div>
        <Footer />
      </main>

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
    </>
  );
};

export default App;
