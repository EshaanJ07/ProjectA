interface Props {
  title: string;
}

const Title = ({ title }: Props) => {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
};

export default Title;
