import { SVGProps } from 'react';

export function EmailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
      <path stroke="#000" strokeMiterlimit={10} d="M21.5 5h-19v14h19V5Z" />
      <path stroke="#000" strokeMiterlimit={10} d="m2.5 5 9.5 7 9.5-7" />
    </svg>
  );
}
