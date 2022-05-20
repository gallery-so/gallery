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
  var nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
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
  textAreaRef: React.MutableRefObject<HTMLTextAreaElement>;
};

export default function MarkdownShortcuts({ textAreaRef }: Props) {
  // Rather than select the text, we select the range of select characters; this will prevent multiple instances of the same text getting same Markdown applied
  const [selectedRange, setSelectedRange] = useState([
    textAreaRef?.current?.selectionStart || 0,
    textAreaRef?.current?.selectionEnd || 0,
  ]);

  // We track whether the selection updated via user drag, or something external (e.g. a Markdown addition)
  const [userDragged, setUserDragged] = useState(false);

  // Anytime the user selects new text, setSelectedRange to equal the indexes of that text
  useEffect(() => {
    const textArea = textAreaRef?.current;
    if (textArea) {
      const onSelectionChange = () => {
        setUserDragged(true);
        setSelectedRange([textArea.selectionStart, textArea.selectionEnd]);
      };

      onSelectionChange(); // Trigger anytime textAreaRef.current.value changes

      document.addEventListener('selectionchange', onSelectionChange);
      return () => {
        document.removeEventListener('selectionchange', onSelectionChange);
      };
    }
  }, [textAreaRef, textAreaRef?.current?.value]);

  // Whenever selectedRange updates, set the textarea.current.selectionStart and selectionEnd to match
  // This means that we can apply markdown to selected text, but preserve selection afterwards
  useEffect(() => {
    // We do not want to run if the selectedRange updated because of user cursor dragging
    // This leads to a bug in Chrome where the user cannot drag text from the end backwards
    // if (userDragged) return;

    const textArea = textAreaRef?.current;
    if (textArea) {
      textArea.selectionStart = selectedRange[0];
      textArea.selectionEnd = selectedRange[1];
    }
  }, [textAreaRef, selectedRange, userDragged]);

  return (
    <StyledMarkdownShortcutsContainer data-testid="markdown-shortcuts-container">
      <Bold
        selectedRange={selectedRange}
        textAreaRef={textAreaRef}
        setUserDragged={setUserDragged}
      />
      <List
        selectedRange={selectedRange}
        textAreaRef={textAreaRef}
        setUserDragged={setUserDragged}
      />
      <Link
        selectedRange={selectedRange}
        textAreaRef={textAreaRef}
        setUserDragged={setUserDragged}
      />
    </StyledMarkdownShortcutsContainer>
  );
}

const StyledMarkdownShortcutsContainer = styled.div`
  display: flex;
  height: 20px;
`;
