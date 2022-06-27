import { ChangeEventHandler } from 'react';
import styled from 'styled-components';
import noop from 'utils/noop';
import colors from '../colors';
import Spacer from '../Spacer/Spacer';
import ErrorText from '../Text/ErrorText';

type Props = {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  defaultValue?: string;
  autoFocus?: boolean;
  errorMessage?: string;
};

function BigInput({
  onChange = noop,
  placeholder,
  defaultValue,
  autoFocus = false,
  errorMessage,
}: Props) {
  return (
    <>
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
      />
      {errorMessage && (
        <>
          <Spacer height={4} />
          <ErrorText message={errorMessage} />
        </>
      )}
    </>
  );
}

const StyledBigInput = styled.input`
  padding: 12px;
  border: 0;
  font-size: 32px;
  font-family: 'GT Alpina';
  line-height: 36px;
  letter-spacing: -0.03em;
  background: ${colors.faint};
  color: ${colors.offBlack};

  ::placeholder {
    opacity: 0.5;
  }
`;

export default BigInput;
