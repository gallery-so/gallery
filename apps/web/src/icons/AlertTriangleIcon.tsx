import colors, { ColorType } from '~/shared/theme/colors';

type Props = {
  className?: string;
  color?: ColorType;
};

export default function AlertTriangleIcon({ className, color = colors.red }: Props) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 6.33333V10" stroke={color} />
      <path d="M8 11.6667V11" stroke={color} />
      <path d="M7.99999 2L14.6667 13.3333H1.33333L7.99999 2Z" stroke={color} />
    </svg>
  );
}
