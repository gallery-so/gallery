import { ChangeEventHandler, useRef, useEffect, useState, forwardRef, useCallback } from 'react';
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
  textAreaHeight?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { className, onChange = noop, placeholder, defaultValue, autoFocus = false, textAreaHeight },
    ref
  ) => {
    const _ref = useRef<HTMLTextAreaElement>(null);
    const textAreaRef = ref || _ref;

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
        textAreaHeight={textAreaHeight}
        ref={textAreaRef}
      />
    );
  }
);

const StyledTextArea = styled.textarea<TextAreaProps>`
  width: 100%;
  height: 100%;
  padding: 16px;
  font-family: Helvetica Neue;
  border: none;
  border-bottom: 28px solid ${colors.white};
  resize: none;
  font-size: 14px;
  line-height: 20px;
  ${({ textAreaHeight }) => `min-height: ${textAreaHeight}`};
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

export function AutoResizingTextAreaWithCharCount({
  ...textAreaProps
}: TextAreaWithCharCountProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const DEFAULT_TEXTAREA_HEIGHT = 'auto';

  const [textAreaHeight, setTextAreaHeight] = useState(DEFAULT_TEXTAREA_HEIGHT);
  const [parentHeight, setParentHeight] = useState(DEFAULT_TEXTAREA_HEIGHT);

  useEffect(() => {
    if (textAreaRef.current) {
      setTextAreaHeight(`${textAreaRef.current.scrollHeight}px`);
      setParentHeight(`${textAreaRef.current.scrollHeight}px`);
    }
  }, [textAreaProps.defaultValue]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textAreaRef.current) {
      setTextAreaHeight(DEFAULT_TEXTAREA_HEIGHT);
      setParentHeight(`${textAreaRef.current.scrollHeight}px`);
    }

    if (textAreaProps.onChange) {
      textAreaProps.onChange(event);
    }
  }, []);

  return (
    <StyledTextAreaWithCharCount className={textAreaProps.className}>
      <StyledParentContainer
        style={{
          minHeight: parentHeight,
        }}
      >
        <TextArea
          {...textAreaProps}
          ref={textAreaRef}
          textAreaHeight={textAreaHeight}
          onChange={handleChange}
        />
        <StyledCharacterCounter error={textAreaProps.currentCharCount > textAreaProps.maxCharCount}>
          {textAreaProps.currentCharCount}/{textAreaProps.maxCharCount}
        </StyledCharacterCounter>
      </StyledParentContainer>
    </StyledTextAreaWithCharCount>
  );
}

const StyledTextAreaWithCharCount = styled.div`
  position: relative;
  border: 1px solid ${colors.gray50};
`;

const StyledParentContainer = styled.div`
  padding-bottom: 20px;
`;

const StyledCharacterCounter = styled(Caption)<{ error: boolean }>`
  position: absolute;
  bottom: 8px;
  right: 8px;

  color: ${({ error }) => (error ? colors.error : colors.gray50)};
`;
