interface Props {
  name: string;
  score: number;
}
const Score = ({ name, score }: Props) => {
  return (
    <div>
      {name}: {score}
    </div>
  );
};

export default Score;
