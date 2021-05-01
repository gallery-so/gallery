import { ChangeEventHandler } from 'react';
import styled from 'styled-components';
import noop from 'utils/noop';

type Props = {
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

function BigInput({ onChange = noop }: Props) {
  return (
    <StyledBigInput
      placeholder="Username"
      onChange={onChange}
      name="username"
    />
  );
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
