import colors, { ColorType } from '~/shared/theme/colors';

type Props = {
  className?: string;
  color?: ColorType;
};

export default function CheckIcon({ className, color = colors.offBlack }: Props) {
  return (
    <svg
      className={className}
      width="8"
      height="6"
      viewBox="0 0 8 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.33331 2.66665L3.33331 4.66665L6.66665 1.33331"
        stroke={color}
        strokeMiterlimit="10"
      />
    </svg>
  );
}
