import {
  ChangeEventHandler,
  forwardRef,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';

import colors from '~/shared/theme/colors';
import { noop } from '~/shared/utils/noop';

import MarkdownShortcuts, { setValueAndTriggerOnChange } from '../Markdown/MarkdownShortcuts';
import { BaseM } from '../Text/Text';

type TextAreaProps = {
  className?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder: string;
  defaultValue?: string;
  autoFocus?: boolean;
  textAreaHeight?: string;
  showMarkdownShortcuts?: boolean;
  hasPadding?: boolean;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: () => void;
};

function isCursorInsideParentheses(textarea: HTMLTextAreaElement) {
  const pattern = /\[(.*?)\]\((.*?)\)/g; // matches `[text](url)`
  const cursorPosition = textarea.selectionStart;
  const cursorEnd = textarea.selectionEnd;
  let match;

  while ((match = pattern.exec(textarea.value)) !== null) {
    const openParenthesisIndex = match.index + match[0].indexOf('(');
    const closeParenthesisIndex = match.index + match[0].indexOf(')');

    if (
      (cursorPosition >= openParenthesisIndex && cursorPosition <= closeParenthesisIndex) ||
      (cursorEnd >= openParenthesisIndex && cursorEnd <= closeParenthesisIndex)
    ) {
      return true;
    }
  }

  return false;
}

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
      maxLength,
      onFocus = noop,
      onBlur = noop,
    },
    ref
  ) => {
    // If the user is pasting a link, automatically place it in a Markdown link
    const handleKeyDown = useCallback<KeyboardEventHandler>(
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
              if (pastedText.startsWith('http') && !isCursorInsideParentheses(textArea)) {
                event.preventDefault();
                const textBeforeLink = textArea.value.substring(0, selectionStart);
                const textAfterLink = textArea.value.substring(
                  selectionStart + pastedText.length,
                  textArea.value.length
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
          onFocus={onFocus}
          onBlur={onBlur}
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
          maxLength={maxLength}
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
  color: ${colors.black['800']};
  ${({ textAreaHeight }) => `min-height: ${textAreaHeight}`};
`;

TextArea.displayName = 'TextArea';

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
  const [isFocused, setFocus] = useState(false);

  const handleFocus = useCallback(() => {
    setFocus(true);
  }, []);

  const handleBlur = useCallback(() => {
    setFocus(false);
  }, []);

  return (
    <>
      <StyledTextAreaWithCharCount
        className={className}
        hasError={currentCharCount > maxCharCount}
        isFocused={isFocused}
      >
        <TextArea ref={textAreaRef} {...textAreaProps} onFocus={handleFocus} onBlur={handleBlur} />

        <StyledCharacterCounter
          hasError={currentCharCount > maxCharCount}
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

  const [isFocused, setFocus] = useState(false);

  const handleFocus = useCallback(() => {
    setFocus(true);
  }, []);

  const handleBlur = useCallback(() => {
    setFocus(false);
  }, []);

  return (
    <StyledTextAreaWithCharCount
      className={textAreaProps.className}
      hasError={textAreaProps.currentCharCount > textAreaProps.maxCharCount}
      isFocused={isFocused}
    >
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
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <StyledCharacterCounter
          hasError={textAreaProps.currentCharCount > textAreaProps.maxCharCount}
          hasPadding={textAreaProps?.hasPadding || false}
        >
          {textAreaProps.currentCharCount}/{textAreaProps.maxCharCount}
        </StyledCharacterCounter>
      </StyledParentContainer>
    </StyledTextAreaWithCharCount>
  );
}

const StyledTextAreaWithCharCount = styled.div<{ hasError: boolean; isFocused: boolean }>`
  position: relative;
  background: ${colors.faint};
  padding-bottom: 1px; /* This fixes a FF bug where the bottom border does not appear */

  border: 1px solid
    ${({ hasError, isFocused }) =>
      hasError ? colors.error : isFocused ? colors.porcelain : 'transparent'};
`;

const StyledParentContainer = styled.div`
  padding-bottom: 32px;
`;

const StyledCharacterCounter = styled(BaseM)<{ hasError: boolean; hasPadding: boolean }>`
  position: absolute;
  bottom: ${({ hasPadding }) => (hasPadding ? '8px' : '0')};
  right: ${({ hasPadding }) => (hasPadding ? '8px' : '0')};

  color: ${({ hasError }) => (hasError ? colors.red : colors.metal)};
`;

const StyledMarkdownContainer = styled.div<{ hasPadding: boolean }>`
  position: absolute;
  background: none;
  bottom: ${({ hasPadding }) => (hasPadding ? '8px' : '0')};
  left: ${({ hasPadding }) => (hasPadding ? '6px' : '0')};
`;
