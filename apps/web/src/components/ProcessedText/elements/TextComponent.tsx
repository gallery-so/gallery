import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function TextComponent({ children, ...props }: Props) {
  return <span {...props}>{children}</span>;
}
