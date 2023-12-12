import { SVGProps } from 'react';

type Props = {
  mode?: 'light' | 'dark';
} & SVGProps<SVGSVGElement>;

export function ProhibitionLogoIcon({ mode = 'light', ...props }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
      <path
        fill={mode === 'dark' ? '#141414' : 'white'}
        d="M0-.002v7.03l7.03-7.03H0ZM24-.002v7.03l-7.03-7.03H24ZM12 4.968l4.97-4.97H7.03L12 4.968ZM0 23.998v-7.03l7.03 7.03H0ZM24 23.998v-7.03l-7.03 7.03H24ZM12 19.027l4.97 4.97H7.03l4.97-4.97ZM4.97 11.998 0 16.968v-9.94l4.97 4.97ZM19.03 11.998l4.97 4.97v-9.94l-4.97 4.97Z"
      />
    </svg>
  );
}
