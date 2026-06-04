interface Props {
  name: string;
  score: number;
  playScoreUp: boolean;
}
const Score = ({ score, playScoreUp }: Props) => {
  return (
    <div className="flex items-center gap-3">
      <span className="font-normal text-[25px]">score</span>
      <div className="h-16 border border-[#000000]"></div>
      <span
        className={`w-5 font-medium text-[30px] text-[#10B981] ${playScoreUp ? "animate-score-pop" : ""}`}
      >
        {score}
      </span>
    </div>
  );
};

export default Score;
