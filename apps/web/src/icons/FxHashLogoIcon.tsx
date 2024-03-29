import { SVGProps } from 'react';

type Props = {
  mode?: 'light' | 'dark';
} & SVGProps<SVGSVGElement>;

export function FxHashLogoIcon({ mode = 'light', ...props }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
      <path fill={mode === 'dark' ? '#141414' : 'white'} d="M24 0H0v24h24V0Z" />
      <path
        fill={mode === 'dark' ? '#fff' : '#000'}
        d="M8.88 6.223a7.52 7.52 0 0 1 1.507.134c.44.09.826.206 1.166.359l-.636 1.516a4.4 4.4 0 0 0-.834-.225 5.442 5.442 0 0 0-.843-.071c-.458 0-.79.08-.987.25-.197.171-.296.45-.296.835v1.05h2.547l-.26 1.613H7.957v5.713H5.643v-5.721H4.002V10.06h1.641v-1.13c0-.511.126-.977.368-1.381s.61-.726 1.085-.969c.484-.233 1.076-.358 1.785-.358ZM14.549 17.39h-2.52l2.68-4.108-2.43-3.704h2.601l1.247 2.502 1.21-2.502h2.476l-2.296 3.623 2.69 4.198h-2.636l-1.543-2.924-1.48 2.915Z"
      />
    </svg>
  );
}
