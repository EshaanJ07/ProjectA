interface Props {
  title: string;
}

const Title = ({ title }: Props) => {
  return (
    <div>
      <h1 className="font-bold text-[30px]">{title}</h1>
    </div>
  );
};

export default Title;
