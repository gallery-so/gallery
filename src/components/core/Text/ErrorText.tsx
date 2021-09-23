import colors from '../colors';
import { Caption } from './Text';

type Props = {
  message: string;
  className?: string;
};

export default function ErrorText({ message, className }: Props) {
  return <Caption className={className} color={colors.error}>{message}</Caption>;
}
