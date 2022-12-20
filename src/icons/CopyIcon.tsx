import colors from '~/components/core/colors';

type Props = {
  className?: string;
  color?: colors;
};

export default function CopyIcon({ className, color = colors.offBlack }: Props) {
  return (
    <svg
      className={className}
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="2.5"
        width="8"
        height="8"
        fill="#FEFEFE"
        stroke={color}
        strokeMiterlimit="3.99933"
      />
      <rect
        x="6"
        y="5.5"
        width="8"
        height="8"
        fill="#FEFEFE"
        stroke={color}
        strokeMiterlimit="3.99933"
      />
    </svg>
  );
}
