import { ReactNode } from 'react';
import { TextProps } from 'react-native';

import { Typography } from '~/components/Typography';

type Props = {
  children: ReactNode;
} & TextProps;
export function TextComponent({ children, ...props }: Props) {
  return (
    <Typography
      className="text-sm"
      font={{ family: 'ABCDiatype', weight: 'Regular' }}
      style={{ fontSize: 14, lineHeight: 18, paddingVertical: 2 }}
      {...props}
    >
      {children}
    </Typography>
  );
}
