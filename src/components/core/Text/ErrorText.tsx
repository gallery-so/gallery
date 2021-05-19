import colors from '../colors';
import { Caption } from './Text';

type Props = {
  message: string;
};

export default function ErrorText({ message }: Props) {
  return <Caption color={colors.error}>{message}</Caption>;
}
