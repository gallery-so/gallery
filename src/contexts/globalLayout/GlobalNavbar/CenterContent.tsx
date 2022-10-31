import { ReactElement } from 'react';

type Props = {
  content: ReactElement;
};

export default function CenterContent({ content }: Props) {
  return content;
}
