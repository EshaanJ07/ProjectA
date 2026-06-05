interface Props {
  name: string;
  onClick?: () => void;
  hoverVariant: "blue" | "red";
  isDisabled: boolean;
  disabled?: boolean;
}

const colors = {
  blue: "hover:bg-[#60A5FA] active:bg-[#60A5FA]",
  red: "hover:bg-[#F87171] active:bg-[#F87171]",
};

const Button = ({
  name,
  onClick,
  hoverVariant,
  isDisabled,
  disabled,
}: Props) => {
  return (
    <button
      className={`btn transition ${colors[hoverVariant]} hover:border-[#000000] active:border-[#000000] hover:scale-105 active:scale-105 btn relative rounded-full h-10 w-25 bg-[#ffffff] border-[#000000] border-2 shadow-[0_4px_4px_1px_rgba(0,0,0,0.25)] ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="absolute flex-center inset-0 font-light text-[22px] ">
        {name}
      </span>
    </button>
  );
};

export default Button;
