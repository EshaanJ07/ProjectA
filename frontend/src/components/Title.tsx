interface Props {
  title: string;
}

const Title = ({ title }: Props) => {
  return (
    <div>
      <h1 className="text-green-500">{title}</h1>
    </div>
  );
};

export default Title;
