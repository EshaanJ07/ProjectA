interface Props {
  score: number;
}

const GameOverScreen = ({ score }: Props) => {
  return <div>Final Score: {score}</div>;
};

export default GameOverScreen;
