import { ChangeEventHandler } from 'react';
import styled from 'styled-components';
import noop from 'utils/noop';
import colors from '../colors';
import Spacer from '../Spacer/Spacer';
import { Caption } from '../Text/Text';

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
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      {errorMessage && (
        <>
          <Spacer height={4} />
          <Error color={colors.error}>{errorMessage}</Error>
        </>
      )}
    </>
  );
}

const StyledBigInput = styled.input`
  padding: 0 2px;
  border: 0;
  font-size: 40px;
  font-family: 'Gallery Display';
  line-height: 48px;
  ::placeholder {
    opacity: 0.5;
  }
`;

const Error = styled(Caption)``;

export default BigInput;
