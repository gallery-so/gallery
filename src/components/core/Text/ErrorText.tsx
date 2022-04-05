import colors from '../colors';
import { BaseM } from './Text';

type Props = {
  message: string;
  className?: string;
};

export default function ErrorText({ message, className }: Props) {
  return (
    <BaseM className={className} color={colors.error}>
      {message}
    </BaseM>
  );
}
