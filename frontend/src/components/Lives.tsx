interface Props {
  count: number;
}
const Lives = ({ count }: Props) => {
  return <div>Lives: {count}</div>;
};

export default Lives;
