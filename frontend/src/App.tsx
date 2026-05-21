import Title from "./components/Title";
import Button from "./components/Button";
import Note from "./components/Note";
import Score from "./components/Score";
import Lives from "./components/Lives";
import { useState } from "react";

const App = () => {
  const [startButtonClicked, setStartButtonClicked] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  return (
    <div>
      <Title title="Note Recognition Test" />
      {!startButtonClicked && (
        <>
          <Button
            name="Start Test"
            onClick={() => setStartButtonClicked(true)}
          />
        </>
      )}

      {startButtonClicked && !gameOver && (
        <>
          <Score name="Score" score={0} />
          <Lives count={3} />
          <Note name="NOTE" />
          <Button
            name="New"
            onClick={() => console.log("New Decision Clicked")}
          />
          <Button
            name="Seen"
            onClick={() => console.log("Seen Decision Clicked")}
          />
          <Button name="End Game" onClick={() => setGameOver(true)} />
        </>
      )}

      {gameOver && (
        <>
          <Score name="Final Score" score={0} />
        </>
      )}
    </div>
  );
};

export default App;
