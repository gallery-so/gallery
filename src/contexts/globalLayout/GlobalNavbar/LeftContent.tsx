import { ReactElement } from 'react';

type Props = {
  content: ReactElement;
};

export default function LeftContent({ content }: Props) {
  return content;
}
