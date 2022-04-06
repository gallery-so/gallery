import { ChangeEventHandler, useRef, useEffect, useState, forwardRef, useCallback } from 'react';
import styled from 'styled-components';
import noop from 'utils/noop';
import colors from '../colors';
import { BaseM } from '../Text/Text';

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
  font-family: ABC Diatype;
  border: none;
  border-bottom: 28px solid ${colors.white};
  resize: none;
  font-size: 14px;
  line-height: 20px;
  background: none;
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

  // Update textArea height when text changes
  useEffect(() => {
    if (textAreaRef.current) {
      setTextAreaHeight(`${textAreaRef.current.scrollHeight}px`);
      setParentHeight(`${textAreaRef.current.scrollHeight}px`);
    }
  }, [textAreaProps.defaultValue]);

  const oldText = useRef(textAreaProps.defaultValue);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (textAreaRef.current) {
        const textWasDeleted = oldText.current // If oldText.current is null/undefined, we do not need to reduce because textarea height will be 0
          ? oldText.current.length > event.target.value.length
          : false;

        // scrollHeight does not decrease when we delete rows of text, so we reset the height to 'auto' whenever text is deleted
        // The useEffect above triggers immediately after, therefore resetting scrollHeight to the height of the content
        // See https://medium.com/@lucasalgus/creating-a-custom-auto-resize-textarea-component-for-your-react-web-application-6959c0ad68bc
        if (textWasDeleted) {
          setTextAreaHeight(DEFAULT_TEXTAREA_HEIGHT);
          setParentHeight(`${textAreaRef.current.scrollHeight}px`);
        }
      }

      oldText.current = event.target.value;

      if (textAreaProps.onChange) {
        textAreaProps.onChange(event);
      }
    },
    [textAreaProps]
  );

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
  border: 1px solid ${colors.metal};
`;

const StyledParentContainer = styled.div`
  padding-bottom: 20px;
`;

const StyledCharacterCounter = styled(BaseM)<{ error: boolean }>`
  position: absolute;
  bottom: 8px;
  right: 8px;

  color: ${({ error }) => (error ? colors.error : colors.metal)};
`;
