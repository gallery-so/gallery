type Props = {
  width?: number;
};
export default function ExpandIcon({ width = 24 }: Props) {
  return (
    <svg
      width={width}
      height={width}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21 10V3H14" stroke="currentColor" />
      <path d="M21 3L14 10" stroke="currentColor" />
      <path d="M3 13.9995V20.9995H10" stroke="currentColor" />
      <path d="M3 21.0005L9.5 14.5005" stroke="currentColor" />
    </svg>
  );
}
