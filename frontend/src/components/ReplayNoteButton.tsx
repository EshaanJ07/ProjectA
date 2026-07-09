interface Props {
  onClick: () => void;
  isDisabled: boolean;
}

const ReplayNoteButton = ({ onClick, isDisabled }: Props) => {
  return (
    <div>
      <button onClick={onClick} disabled={isDisabled}>
        Play Again
      </button>
    </div>
  );
};

export default ReplayNoteButton;
