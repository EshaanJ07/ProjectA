import Header from "./Header";
import AudioMemoryTitle from "./AudioMemoryTitle";
import GameDescription from "./GameDescription";
import AudioCircle from "./AudioCircle";
import StartButton from "./StartButton";
import Footer from "./Footer";

interface Props {
  startGame: () => void;
}

const LandingScreen = ({ startGame }: Props) => {
  return (
    <>
      <Header />
      <main className="pt-15">
        <div className="mx-2">
          <AudioMemoryTitle />
        </div>
        <div className="flex justify-center my-10 h-20 translate-y-5">
          <GameDescription />
        </div>
        <div className="flex-center my-5">
          <AudioCircle />
        </div>
        <div className="flex justify-center">
          <StartButton onClick={startGame} />
        </div>
        <Footer />
      </main>
    </>
  );
};

export default LandingScreen;
