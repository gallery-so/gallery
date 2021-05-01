import { ChangeEventHandler } from 'react';
import styled from 'styled-components';
import noop from 'utils/noop';

type Props = {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
};

function BigInput({ onChange = noop, placeholder }: Props) {
  return <StyledBigInput placeholder={placeholder} onChange={onChange} />;
}

const StyledBigInput = styled.input`
  padding: 10px 2px;
  border: 0;
  font-size: 30px;
  font-family: 'Times New Roman';
  ::placeholder {
    opacity: 0.5;
  }
`;

export default BigInput;
