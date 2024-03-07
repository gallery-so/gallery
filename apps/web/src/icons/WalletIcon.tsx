import { SVGProps } from 'react';

export function WalletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
      <path
        stroke="#000"
        strokeMiterlimit={10}
        strokeWidth={1.053}
        d="M22 4.63H2v14.738h20V4.63Z"
      />
      <path
        stroke="#000"
        strokeMiterlimit={10}
        strokeWidth={1.053}
        d="M22 8.44h-6.754c-2.105 0-3.771 1.591-3.771 3.603 0 2.01 1.666 3.603 3.771 3.603h6.755V8.439Z"
      />
      <path
        fill="#141414"
        stroke="#141414"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={3.429}
        strokeWidth={1.053}
        d="M15.375 12.795a.754.754 0 1 0 0-1.508.754.754 0 0 0 0 1.508Z"
      />
    </svg>
  );
}
