import Header from "./Header";
import AudioMemoryTitle from "./AudioMemoryTitle";
import AudioCircle from "./AudioCircle";
import Footer from "./Footer";
import Score from "./Score";
import Lives from "./Lives";
import Button from "./Button";

interface Props {
  score: number;
  lives: number;
  currentNote: string;
  updateGame: (decision: "new" | "seen") => void;
  playScoreUp: boolean;
  playLifeLoss: boolean;
  playAudioRipple: boolean;
  isDisabled: boolean;
}

const GameScreen = ({
  score,
  lives,
  updateGame,
  playScoreUp,
  playLifeLoss,
  playAudioRipple,
  isDisabled,
}: Props) => {
  return (
    <>
      <>
        <Header />
        <main className="pt-15">
          <div className="mx-2">
            <AudioMemoryTitle />
          </div>

          <div className="flex justify-center my-10 h-20 gap-20 border-2 border-[#000000] w-fit px-5 rounded-[25px] mx-auto translate-y-5">
            <Score name="Score" score={score} playScoreUp={playScoreUp} />
            <Lives count={lives} playLifeLoss={playLifeLoss} />
          </div>

          <div className="flex-center my-5">
            <AudioCircle playAudioRipple={playAudioRipple} />
          </div>
          <div className="flex justify-center gap-5">
            <Button
              name="new"
              hoverVariant="blue"
              onClick={() => updateGame("new")}
              isDisabled={isDisabled}
              disabled={isDisabled}
            />
            <Button
              name="heard"
              hoverVariant="red"
              onClick={() => updateGame("seen")}
              isDisabled={isDisabled}
              disabled={isDisabled}
            />
          </div>

          <Footer />
        </main>
      </>
    </>
  );
};

export default GameScreen;
