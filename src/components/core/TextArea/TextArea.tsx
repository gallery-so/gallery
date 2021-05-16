import { ChangeEventHandler } from 'react';
import styled from 'styled-components';
import colors from '../colors';
import noop from 'utils/noop';

type Props = {
  className?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder: string;
};

function TextArea({ className, onChange = noop, placeholder }: Props) {
  return (
    <StyledTextArea
      className={className}
      placeholder={placeholder}
      onChange={onChange}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
    />
  );
}

const StyledTextArea = styled.textarea`
  padding: 14px;
  font-family: Helvetica Neue;
  border-color: ${colors.gray50};
  resize: none;
`;

export default TextArea;
