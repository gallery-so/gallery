import { SVGProps } from 'react';

import colors from '~/shared/theme/colors';

type Props = {
  mode?: 'light' | 'dark';
} & SVGProps<SVGSVGElement>;

export function SuperRareLogoIcon({ mode = 'light', ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={20}
      viewBox="0 0 48 40"
      fill="none"
      {...props}
    >
      <path
        fill={mode === 'dark' ? colors.black.DEFAULT : colors.white}
        fillRule="evenodd"
        d="M36.947 0H10.42L0 11.154l23.677 28.004 23.69-28.004L36.947 0ZM11.473 11.154l6.994-7.488h15.7l6.993 7.488-14.843 17.555-14.844-17.555Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
