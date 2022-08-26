import colors from 'components/core/colors';

type Props = {
  className?: string;
  color?: colors;
};

export default function LogoBracketLeft({ className, color = colors.offBlack }: Props) {
  return (
    <svg
      className={className}
      width="5"
      height="16"
      viewBox="0 0 5 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.60868 15.8058C-1.24566 12.3525 -1.24346 3.64478 4.60868 0.193115L4.89958 0.650388C3.70569 1.47687 2.72894 2.57931 2.05229 3.86405C-0.0495596 7.81157 1.20384 12.8296 4.89958 15.3496L4.60868 15.8069V15.8058Z"
        fill={color}
      />
    </svg>
  );
}
