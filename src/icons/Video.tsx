import colors from 'components/core/colors';
import noop from 'utils/noop';

type Props = {
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  color?: string;
};

export default function Video({
  className,
  onClick = noop,
  onMouseEnter = noop,
  onMouseLeave = noop,
  color = colors.shadow,
}: Props) {
  return (
    <svg
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.6666 8.00012L14.3333 11.0001V5.00012L10.6666 8.00012Z"
        stroke={color}
        strokeMiterlimit="10"
      />
      <path
        d="M2.33337 3.66675H9.66671L10.6667 4.66675V11.3334L9.66671 12.3334H2.33337L1.33337 11.3334V4.66675L2.33337 3.66675Z"
        stroke={color}
        strokeMiterlimit="10"
      />
    </svg>
  );
}
