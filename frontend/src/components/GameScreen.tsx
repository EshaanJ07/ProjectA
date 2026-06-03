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
}

const GameScreen = ({ score, lives, updateGame }: Props) => {
  return (
    <>
      <>
        <Header />
        <main className="pt-15">
          <div className="mx-2">
            <AudioMemoryTitle />
          </div>
          <div className="flex justify-center">
            <div className="flex justify-center my-10 translate-y-5 h-20 gap-20 bg-[#93C5FD] w-fit px-5 rounded-[25px]">
              <Score name="Score" score={score} />
              <Lives count={lives} />
            </div>
          </div>

          <div className="flex-center my-5">
            <AudioCircle />
          </div>
          <div className="flex justify-center gap-5">
            <Button
              name="new"
              hoverVariant="blue"
              onClick={() => updateGame("new")}
            />
            <Button
              name="heard"
              hoverVariant="red"
              onClick={() => updateGame("seen")}
            />
          </div>

          <Footer />
        </main>
      </>
    </>
  );
};

export default GameScreen;
