import colors from 'components/core/colors';

type Props = {
  className?: string;
  color?: string;
};

export default function PlusIcon({ className, color = colors.white }: Props) {
  return (
    <svg
      className={className}
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 0.00012207V8.00012" stroke={color} />
      <path d="M8 4.00012H0" stroke={color} />
    </svg>
  );
}
