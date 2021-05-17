import { ChangeEventHandler } from 'react';
import styled from 'styled-components';
import noop from 'utils/noop';

type Props = {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  defaultValue?: string;
  autoFocus?: boolean;
};

function BigInput({
  onChange = noop,
  placeholder,
  defaultValue,
  autoFocus = false,
}: Props) {
  return (
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
  );
}

const StyledBigInput = styled.input`
  padding: 0 2px;
  border: 0;
  font-size: 32px;
  font-family: 'Times New Roman';
  line-height: 44px;
  ::placeholder {
    opacity: 0.5;
  }
`;

export default BigInput;
