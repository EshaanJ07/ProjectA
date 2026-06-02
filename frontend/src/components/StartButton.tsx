interface Props {
  onClick?: () => void;
}

const StartButton = ({ onClick }: Props) => {
  return (
    <button
      className="transition hover:bg-[#818CF8] active:bg-[#818CF8] hover:border-[#3730A3] active:border-[#3730A3] hover:scale-105 active:scale-105 btn relative rounded-full h-10 w-25 bg-[#ffffff] border-[#000000] border-2 shadow-[0_4px_4px_1px_rgba(0,0,0,0.25)] drop-shadow-2xl"
      onClick={onClick}
      type="button"
    >
      <span className="absolute flex-center inset-0 font-normal text-[26px] ">
        begin
      </span>
    </button>
  );
};

export default StartButton;
