type Props = {
  color?: string;
};

export function AllGalleriesIcon({ color = 'currentColor' }: Props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.6666 2.26672H2.2666V6.67339H6.6666V2.26672Z" stroke={color} />
      <path d="M13.6666 2.26672H9.2666V6.67339H13.6666V2.26672Z" stroke={color} />
      <path d="M6.6666 9.26672H2.2666V13.6734H6.6666V9.26672Z" stroke={color} />
      <path d="M13.6666 9.26672H9.2666V13.6734H13.6666V9.26672Z" stroke={color} />
    </svg>
  );
}
