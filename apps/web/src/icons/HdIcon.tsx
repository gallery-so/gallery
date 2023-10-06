import colors from '~/shared/theme/colors';
import { noop } from '~/shared/utils/noop';

type Props = {
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  color?: string;
};

export default function HdIcon({
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
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M3.246 10.6667V5.53334H4.17V7.638H6.58267V5.53334H7.50667V10.6667H6.58267V8.42267H4.17V10.6667H3.246Z"
        fill={color}
      />
      <path
        d="M8.94623 10.6667V5.53334H10.7282C11.3051 5.53334 11.7965 5.63111 12.2022 5.82667C12.608 6.02223 12.9185 6.31311 13.1336 6.69934C13.3487 7.08067 13.4562 7.55 13.4562 8.10734C13.4562 8.62556 13.3536 9.07778 13.1482 9.464C12.9429 9.84534 12.6373 10.1411 12.2316 10.3513C11.8307 10.5616 11.3418 10.6667 10.7649 10.6667H8.94623ZM10.6989 9.882C11.0705 9.882 11.3907 9.81845 11.6596 9.69134C11.9333 9.56423 12.1411 9.36867 12.2829 9.10467C12.4296 8.83578 12.5029 8.50334 12.5029 8.10734C12.5029 7.726 12.4345 7.40334 12.2976 7.13934C12.1656 6.87534 11.9627 6.67245 11.6889 6.53067C11.42 6.38889 11.0876 6.318 10.6916 6.318H9.87023V9.882H10.6989Z"
        fill={color}
      />
      <path
        d="M2.66667 12C3.28402 12.8307 4.0863 13.5063 5.00998 13.9732C5.93366 14.4401 6.95336 14.6855 7.98833 14.69C9.02331 14.6946 10.0451 14.4581 10.9728 13.9993C11.9006 13.5404 12.7087 12.8719 13.3333 12.0467"
        stroke={color}
        stroke-width="0.8"
      />
      <path
        d="M13.3333 4C12.7154 3.17561 11.9147 2.50566 10.9942 2.04276C10.0738 1.57986 9.05857 1.33661 8.02827 1.33208C6.99798 1.32756 5.98066 1.5619 5.05617 2.0167C4.13168 2.47151 3.32519 3.13439 2.7 3.95333"
        stroke={color}
        stroke-width="0.8"
      />
    </svg>
  );
}
