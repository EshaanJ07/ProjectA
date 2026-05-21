interface Props {
  name: string;
  onClick?: () => void;
}

const Button = ({ name, onClick }: Props) => {
  return (
    <button className="btn" type="button" onClick={onClick}>
      {name}
    </button>
  );
};

export default Button;
