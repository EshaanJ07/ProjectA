interface Props {
  name: string;
  score: number;
}
const Score = ({ name, score }: Props) => {
  return (
    <div className="flex items-center gap-3">
      <span className="font-normal text-[25px]">score</span>
      <div className="h-20 border border-[#D1D5DB]"></div>
      <span className="font-medium text-[30px] text-[#10B981]">{score}</span>
    </div>
  );
};

export default Score;
