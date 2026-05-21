interface Props {
  name: string;
}

const Note = ({ name }: Props) => {
  return <div>{name}</div>;
};

export default Note;
