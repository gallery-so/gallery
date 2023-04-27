import colors, { ColorType } from '~/shared/theme/colors';

type Props = {
  className?: string;
  color?: ColorType;
};

export default function CircleCheckIcon({ className, color = colors.offBlack }: Props) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.99999 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 7.99999 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 7.99999 14.6667Z"
        stroke={color}
      />
      <path d="M5.33333 8L7.33333 10L10.6667 6.66667" stroke={color} />
    </svg>
  );
}
