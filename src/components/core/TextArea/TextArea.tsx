import { ChangeEventHandler, useRef, useEffect, useState, forwardRef, useCallback } from 'react';
import styled from 'styled-components';
import noop from 'utils/noop';
import colors from '../colors';
import { BaseM } from '../Text/Text';
import MarkdownShortcuts, { setValueAndTriggerOnChange } from '../Markdown/MarkdownShortcuts';

type TextAreaProps = {
  className?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder: string;
  defaultValue?: string;
  autoFocus?: boolean;
  textAreaHeight?: string;
  showMarkdownShortcuts?: boolean;
  hasPadding?: boolean;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      onChange = noop,
      placeholder,
      defaultValue,
      autoFocus = false,
      textAreaHeight,
      showMarkdownShortcuts = false,
      hasPadding = false,
    },
    ref
  ) => {
    // If the user is pasting a link, automatically place it in a Markdown link
    const handleKeyDown = useCallback(
      async (event) => {
        if (event.key === 'v' && event.metaKey) {
          // Wrap in a try/catch because navigator.clipboard.readText() is not supported in Firefox. If it fails, pasting behavior will be default
          try {
            // @ts-expect-error: Handle Typescript error from forwardRef
            if (ref?.current) {
              // @ts-expect-error: Handle Typescript error from forwardRef
              const textArea = ref?.current;
              const [selectionStart, selectionEnd] = [
                textArea.selectionStart,
                textArea.selectionEnd,
              ];
              const selectedText = textArea.value.substring(selectionStart, selectionEnd);
              const pastedText = await navigator.clipboard.readText();
              if (pastedText.startsWith('http')) {
                event.preventDefault();

                const textBeforeLink = textArea.value.substring(0, selectionStart);
                const textAfterLink = textArea.value.substring(
                  selectionStart + pastedText.length,
                  selectionEnd + pastedText.length
                );
                const newValue = `${textBeforeLink}[${selectedText}](${pastedText})${textAfterLink}`;

                const newSelectionStart = selectionStart + 1;
                const newSelectionEnd = selectionStart + selectedText.length + 1;
                setValueAndTriggerOnChange(textArea, newValue, [
                  newSelectionStart,
                  newSelectionEnd,
                ]);
              }
            }
          } catch (error) {
            // Ignore error
          }
        }
      },
      [ref]
    );

    return (
      <>
        <StyledTextArea
          className={className}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChange={onChange}
          onKeyUp={(e) => e.stopPropagation()} // To prevent keyboard navigation from triggering while in textarea
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          textAreaHeight={textAreaHeight}
          ref={ref}
          hasPadding={hasPadding}
          onKeyDown={handleKeyDown}
        />
        {showMarkdownShortcuts && (
          <StyledMarkdownContainer hasPadding={hasPadding}>
            <MarkdownShortcuts textAreaRef={ref as React.MutableRefObject<HTMLTextAreaElement>} />
          </StyledMarkdownContainer>
        )}
      </>
    );
  }
);

const StyledTextArea = styled.textarea<TextAreaProps>`
  width: 100%;
  height: 100%;
  padding: 12px;
  font-family: 'ABC Diatype', Helvetica, Arial, sans-serif;
  border: none;
  border-bottom: 36px solid transparent;
  resize: none;
  font-size: 14px;
  line-height: 20px;
  background: none;
  color: ${colors.offBlack};
  ${({ textAreaHeight }) => `min-height: ${textAreaHeight}`};
`;

TextArea.displayName = 'TextArea';

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
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <>
      <StyledTextAreaWithCharCount className={className}>
        <TextArea ref={textAreaRef} {...textAreaProps} />
        <StyledCharacterCounter
          error={currentCharCount > maxCharCount}
          hasPadding={textAreaProps?.hasPadding || false}
        >
          {currentCharCount}/{maxCharCount}
        </StyledCharacterCounter>
      </StyledTextAreaWithCharCount>
    </>
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
        <StyledCharacterCounter
          error={textAreaProps.currentCharCount > textAreaProps.maxCharCount}
          hasPadding={textAreaProps?.hasPadding || false}
        >
          {textAreaProps.currentCharCount}/{textAreaProps.maxCharCount}
        </StyledCharacterCounter>
      </StyledParentContainer>
    </StyledTextAreaWithCharCount>
  );
}

const StyledTextAreaWithCharCount = styled.div`
  position: relative;
  background: ${colors.faint};
  padding-bottom: 1px; /* This fixes a FF bug where the bottom border does not appear */
`;

const StyledParentContainer = styled.div`
  padding-bottom: 32px;
`;

const StyledCharacterCounter = styled(BaseM)<{ error: boolean; hasPadding: boolean }>`
  position: absolute;
  bottom: ${({ hasPadding }) => (hasPadding ? '8px' : '0')};
  right: ${({ hasPadding }) => (hasPadding ? '8px' : '0')};

  color: ${({ error }) => (error ? colors.error : colors.metal)};
`;

const StyledMarkdownContainer = styled.div<{ hasPadding: boolean }>`
  position: absolute;
  background: none;
  bottom: ${({ hasPadding }) => (hasPadding ? '12px' : '0')};
  left: ${({ hasPadding }) => (hasPadding ? '8px' : '0')};
`;
