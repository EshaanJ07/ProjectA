interface Props {
  count: number;
}
const Lives = ({ count }: Props) => {
  return (
    <div className="flex items-center gap-3">
      <span className="font-normal text-[25px]">lives</span>
      <div className="h-20 border border-[#D1D5DB]"></div>
      <span className="font-medium text-[30px] text-[#EF4444]">{count}</span>
    </div>
  );
};

export default Lives;
