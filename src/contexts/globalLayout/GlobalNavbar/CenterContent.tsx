import { ReactElement } from 'react';

type Props = {
  content: ReactElement | null;
};

export default function CenterContent({ content }: Props) {
  return content;
}
