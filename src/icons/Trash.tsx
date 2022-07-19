import colors from 'components/core/colors';

type Props = {
  className?: string;
  color?: string;
};

export default function Trash({ className, color = colors.white }: Props) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
    >
      <polyline points="3 7 5 7 21 7" fill="none" stroke={color} />
      <path d="M18.5,7l-1,14H6.5L5.5,7M8,7l.5-3.5h7L16,7" fill="none" stroke={color} />
    </svg>
  );
}
