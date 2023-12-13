import { SVGProps } from 'react';

type Props = {
  size?: number;
} & SVGProps<SVGSVGElement>;

export function EnsembleLogoIcon({ size = 24, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 2"
      viewBox="0 0 1073.71 624.85"
      width={size}
      height={size}
      {...props}
    >
      <path
        d="M0 0h1050.82v128.48h-790.3v115.31h717.24v126.73H260.52v125.86h813.19v128.48H0V0Z"
        data-name="Layer 1"
        style={{
          strokeWidth: 0,
        }}
      />
    </svg>
  );
}
