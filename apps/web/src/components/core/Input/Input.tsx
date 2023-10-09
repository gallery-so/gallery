import { ChangeEventHandler, HTMLInputTypeAttribute } from 'react';
import styled from 'styled-components';

import colors from '~/shared/theme/colors';
import { noop } from '~/shared/utils/noop';

import breakpoints from '../breakpoints';
import { VStack } from '../Spacer/Stack';
import ErrorText from '../Text/ErrorText';

type Props = {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  defaultValue?: string;
  autoFocus?: boolean;
  errorMessage?: string;
  variant?: 'grande' | 'medium';
  type?: HTMLInputTypeAttribute;
};

function Input({
  onChange = noop,
  placeholder,
  defaultValue,
  autoFocus = false,
  errorMessage,
  variant = 'medium',
  type,
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
        type={type}
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
  color: ${colors.black['800']};

  ::placeholder {
    opacity: 0.5;
  }
`;

export const SlimInput = styled.input`
  font-family: 'ABC Diatype', Helvetica, Arial, sans-serif;
  border: 0;
  background-color: ${colors.faint};
  padding: 6px 12px;
  width: 100%;
  height: 32px;

  font-size: 16px; // on mobile, if input font is < 16px, OS will zoom automatically on the input which we dont want

  @media only screen and ${breakpoints.desktop} {
    font-size: 14px;
  }
`;

export default Input;
