import { SVGProps } from 'react';

export function QrCodeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
      <path
        stroke="#141414"
        strokeMiterlimit={10}
        d="M22 6V2h-4M2 18v4h4M18 22h4v-4M6 2H2v4M10.5 5.5h-5v5h5v-5ZM18.5 5.5h-5v5h5v-5ZM13.5 19v-6M18.5 16v2.5H16M16 13.5h3M10.5 13.5h-5v5h5v-5ZM7.5 8h1M15.5 8h1M7.5 16h1M16.5 16h-3"
      />
    </svg>
  );
}
