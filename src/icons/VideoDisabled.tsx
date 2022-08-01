import colors from 'components/core/colors';
import noop from 'utils/noop';

type Props = {
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  color?: string;
};

export default function VideoDisabled({
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
        d="M10.6668 10.3337V11.3337L9.66683 12.3337H2.3335L1.3335 11.3337V4.66699L2.3335 3.66699H4.00016"
        stroke={color}
        strokeMiterlimit="10"
      />
      <path
        d="M6.6665 3.66699H9.6665L10.6665 4.66699V7.33366H11.3332L14.9998 4.66699V10.3337"
        stroke={color}
        strokeMiterlimit="10"
      />
      <path d="M2.3335 2.00024L13.6668 13.3336" stroke={color} strokeMiterlimit="10" />
    </svg>
  );
}
