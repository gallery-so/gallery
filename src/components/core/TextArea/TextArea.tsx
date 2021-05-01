import { ChangeEventHandler } from 'react';
import styled from 'styled-components';
import colors from '../colors';
import noop from 'utils/noop';

type Props = {
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder: string;
};

function TextArea({ onChange = noop, placeholder }: Props) {
  return <StyledTextArea placeholder={placeholder} onChange={onChange} />;
}

const StyledTextArea = styled.textarea`
  padding: 14px;
  font-family: Helvetica Neue;
  border-color: ${colors.gray50};
  resize: none;
`;

export default TextArea;
