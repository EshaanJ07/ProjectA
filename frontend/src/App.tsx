import { useState } from "react";
import { noteMap, noteNames, preloadAllNotes } from "./assets/audio/noteMap.ts";
import LandingScreen from "./components/LandingScreen";
import GameScreen from "./components/GameScreen";
import GameOverScreen from "./components/GameOverScreen";

const BASE_URL = "http://127.0.0.1:8000";

let noteAudio: HTMLAudioElement | null = null;

preloadAllNotes(); // Preload all audio files on app load

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
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentNote, setCurrentNote] = useState("");
  const [playScoreUp, setPlayScoreUp] = useState(false);
  const [playLifeLoss, setPlayLifeLoss] = useState(false);
  const [playAudioRipple, setPlayAudioRipple] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const ActivateAudioRipple = () => {
    //Plays Audio Ripple animation
    setPlayAudioRipple(true);
    setTimeout(() => {
      setPlayAudioRipple(false);
    }, 800);
  };

  const DisableButtonsTemporarily = () => {
    //Disables buttons (targetting New and Heard) for same time as audio ripple animation
    setIsDisabled(true);
    setTimeout(() => {
      setIsDisabled(false);
    }, 800);
  };
  const startGame = async () => {
    setStartGame(true);

    const response = await fetch(`${BASE_URL}/create-game`, { method: "POST" });

    const new_game = await response.json();

    playNote(new_game.current_note);
    ActivateAudioRipple();
    DisableButtonsTemporarily();
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
      //Game over check
      noteAudio?.pause();
      setGameOver(true);
      return;
    }

    if (updated_game.lives < lives) {
      //Update score animation
      setPlayLifeLoss(true);

      setTimeout(() => {
        setPlayLifeLoss(false);
      }, 300);
    }

    if (updated_game.score > score) {
      //Update life animation
      setPlayScoreUp(true);

      setTimeout(() => {
        setPlayScoreUp(false);
      }, 300);
    }

    playNote(updated_game.current_note);
    ActivateAudioRipple();
    DisableButtonsTemporarily();
    setCurrentNote(updated_game.current_note);
    setScore(updated_game.score);
    setLives(updated_game.lives);
  };

  const replayNote = (currentNote: string) => {
    playNote(currentNote);
    ActivateAudioRipple();
    DisableButtonsTemporarily();
  };

  return (
    <>
      {!hasGameStarted && <LandingScreen startGame={startGame} />}

      {hasGameStarted && !gameOver && (
        <GameScreen
          score={score}
          lives={lives}
          currentNote={currentNote}
          updateGame={updateGame}
          playScoreUp={playScoreUp}
          playLifeLoss={playLifeLoss}
          playAudioRipple={playAudioRipple}
          isDisabled={isDisabled}
          replayNote={replayNote}
        />
      )}

      {gameOver && (
        <>
          <GameOverScreen score={score} /> {/* Needs UI implementation */}
        </>
      )}
    </>
  );
};

export default App;
