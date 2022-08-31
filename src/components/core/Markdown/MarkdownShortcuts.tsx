import { captureException } from '@sentry/nextjs';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Bold from './Bold';
import Link from './Link';
import List from './List';

// Use the TextArea element's native setter and dispatch an input event to trigger the onChange callback
export function setValueAndTriggerOnChange(
  textArea: HTMLTextAreaElement,
  newValue: string,
  selectionRange: [number, number]
) {
  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value'
  )?.set;

  if (!nativeTextAreaValueSetter) {
    // unlikely, but if the native setter is not available, set the value directly. this will not trigger the onChange callback.
    textArea.value = newValue;
    captureException(new Error('Native TextArea setter not available'));
    return;
  }

  nativeTextAreaValueSetter.call(textArea, newValue);
  textArea.dispatchEvent(new Event('input', { bubbles: true }));

  textArea.selectionStart = selectionRange[0];
  textArea.selectionEnd = selectionRange[1];
}

type Props = {
  textAreaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
};

export default function MarkdownShortcuts({ textAreaRef }: Props) {
  // Rather than select the text, we select the range of select characters; this will prevent multiple instances of the same text getting same Markdown applied
  const [selectedRange, setSelectedRange] = useState([
    textAreaRef?.current?.selectionStart || 0,
    textAreaRef?.current?.selectionEnd || 0,
  ]);

  // Anytime the user selects new text, setSelectedRange to equal the indexes of that text
  useEffect(() => {
    const textArea = textAreaRef?.current;
    if (textArea) {
      const onSelectionChange = () => {
        setSelectedRange([textArea.selectionStart, textArea.selectionEnd]);
      };

      onSelectionChange(); // Trigger anytime textAreaRef.current.value changes

      document.addEventListener('selectionchange', onSelectionChange);
      return () => {
        document.removeEventListener('selectionchange', onSelectionChange);
      };
    }
  }, [textAreaRef, textAreaRef?.current?.value]);

  return (
    <StyledMarkdownShortcutsContainer data-testid="markdown-shortcuts-container">
      <Bold selectedRange={selectedRange} textAreaRef={textAreaRef} />
      <List selectedRange={selectedRange} textAreaRef={textAreaRef} />
      <Link selectedRange={selectedRange} textAreaRef={textAreaRef} />
    </StyledMarkdownShortcutsContainer>
  );
}

const StyledMarkdownShortcutsContainer = styled.div`
  display: flex;
  height: 20px;
`;
