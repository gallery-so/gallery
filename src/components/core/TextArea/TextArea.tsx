import { ChangeEventHandler } from 'react';
import styled from 'styled-components';
import noop from 'utils/noop';
import colors from '../colors';
import { Caption } from '../Text/Text';

type TextAreaProps = {
  className?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder: string;
  defaultValue?: string;
  autoFocus?: boolean;
};

export function TextArea({
  className,
  onChange = noop,
  placeholder,
  defaultValue,
  autoFocus = false,
}: TextAreaProps) {
  return (
    <StyledTextArea
      className={className}
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={onChange}
      autoFocus={autoFocus}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
    />
  );
}

const StyledTextArea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 16px;
  font-family: Helvetica Neue;
  border: none;
  border-bottom: 28px solid ${colors.white};
  resize: none;
  font-size: 14px;
  line-height: 20px;
`;

export default TextArea;

type TextAreaWithCharCountProps = {
  className?: string;
  currentCharCount: number;
  maxCharCount: number;
} & TextAreaProps;

export function TextAreaWithCharCount({
  className,
  currentCharCount,
  maxCharCount,
  ...textAreaProps
}: TextAreaWithCharCountProps) {
  return (
    <StyledTextAreaWithCharCount className={className}>
      <TextArea {...textAreaProps} />
      <StyledCharacterCounter error={currentCharCount > maxCharCount}>
        {currentCharCount}/{maxCharCount}
      </StyledCharacterCounter>
    </StyledTextAreaWithCharCount>
  );
}

const StyledTextAreaWithCharCount = styled.div`
  position: relative;
  border: 1px solid ${colors.gray50};
`;

const StyledCharacterCounter = styled(Caption)<{ error: boolean }>`
  position: absolute;
  bottom: 8px;
  right: 8px;

  color: ${({ error }) => (error ? colors.error : colors.gray50)};
`;
