interface Props {
  count: number;
}

const lifeColors: Record<number, string> = {
  3: "text-[#10B981]",
  2: "text-[#FBBF24]",
  1: "text-[#F87171]",
  [-1]: "text-[#10B981]",
};

const Lives = ({ count }: Props) => {
  return (
    <div className="flex items-center gap-3">
      <span className="font-normal text-[25px]">lives</span>
      <div className="h-16 border border-[#000000]"></div>
      <span className={`w-5 font-medium ${lifeColors[count]} text-[30px]`}>
        {count}
      </span>
    </div>
  );
};

export default Lives;
