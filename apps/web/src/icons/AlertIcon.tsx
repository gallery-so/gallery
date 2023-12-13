type Props = {
  height?: number;
  width?: number;
};

export default function AlertIcon({ height = 24, width = 24 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 9.5V15" stroke="#F00000" />
      <path d="M12 17.5V16.5" stroke="#F00000" />
      <path d="M12 3L22 20H2L12 3Z" stroke="#F00000" />
    </svg>
  );
}
