import { ChangeEventHandler } from 'react';
import styled from 'styled-components';
import noop from 'utils/noop';
import colors from '../colors';
import { VStack } from '../Spacer/Stack';
import ErrorText from '../Text/ErrorText';

type Props = {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  defaultValue?: string;
  autoFocus?: boolean;
  errorMessage?: string;
  variant?: 'grande' | 'medium';
};

function Input({
  onChange = noop,
  placeholder,
  defaultValue,
  autoFocus = false,
  errorMessage,
  variant = 'medium',
}: Props) {
  return (
    <VStack gap={4}>
      <StyledBigInput
        autoFocus={autoFocus}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={onChange}
        onKeyUp={(e) => e.stopPropagation()}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        variant={variant}
      />
      {errorMessage && <ErrorText message={errorMessage} />}
    </VStack>
  );
}

const StyledBigInput = styled.input<{ variant: Props['variant'] }>`
  font-family: GT Alpina, serif;
  padding: ${({ variant }) => (variant === 'grande' ? 12 : 8)}px;
  font-size: ${({ variant }) => (variant === 'grande' ? 32 : 16)}px;
  line-height: ${({ variant }) => (variant === 'grande' ? 32 : 20)}px;
  letter-spacing: -0.03em;
  border: 0;
  background: ${colors.faint};
  color: ${colors.offBlack};

  ::placeholder {
    opacity: 0.5;
  }
`;

export default Input;
