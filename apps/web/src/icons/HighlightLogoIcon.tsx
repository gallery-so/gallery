import { SVGProps } from 'react';

type Props = {
  mode?: 'light' | 'dark';
} & SVGProps<SVGSVGElement>;
export function HighlightLogoIcon({ mode = 'light', ...props }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={17} fill="none" {...props}>
      <path
        fill={mode === 'dark' ? '#000' : '#fff'}
        fillRule="evenodd"
        d="M0 0v17h15.652C20.262 17 24 13.194 24 8.5S20.263 0 15.652 0H0Zm14.765 1.867c-3.211.44-5.687 3.242-5.687 6.633 0 3.39 2.476 6.192 5.687 6.633V1.867Zm1.774 13.266c3.211-.44 5.687-3.242 5.687-6.633 0-3.39-2.476-6.192-5.687-6.633v13.266Zm-6.032.06A8.541 8.541 0 0 1 7.304 8.5a8.541 8.541 0 0 1 3.203-6.694H1.774v13.388h8.733Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
