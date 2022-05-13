import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Bold from './Bold';
import Link from './Link';
import List from './List';

export default function MarkdownShortcuts({
  textAreaRef,
  onChange, // The onChange from the TextArea component. This ensures that we track the same event handlers (e.g. a collector's note change) via the addition of just markdown
}: {
  // textAreaRef:
  //   | ((instance: HTMLTextAreaElement) => void)
  //   | React.MutableRefObject<HTMLTextAreaElement | null>;
  textAreaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}) {
  // Trigger onChange whenever textAreaRef.current changes
  useEffect(() => {
    if (textAreaRef.current) {
      const event = new CustomEvent('change', {
        detail: { value: textAreaRef.current.value },
      });
      Object.defineProperty(event, 'target', {
        value: textAreaRef.current,
      });
      // textAreaRef.current.dispatchEvent(event);
      // onChange(event as React.ChangeEvent<HTMLTextAreaElement>);
      onChange(event);
    }
  }, [textAreaRef?.current?.value, onChange, textAreaRef]);

  // Rather than select the text, we select the range of select characters; this will prevent multiple instances of the same text getting same Markdown applied
  const [selectedRange, setSelectedRange] = useState([
    textAreaRef?.current?.selectionStart || 0,
    textAreaRef?.current?.selectionEnd || 0,
  ]);

  // We track whether the selection updated via user drag, or something external (e.g. a Markdown addition)
  const [userDragged, setUserDragged] = useState(false);

  // Anytime the user selects new text, setSelectedRange to equal the indexes of that text
  useEffect(() => {
    const textArea = textAreaRef.current;
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
    if (userDragged) return;

    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.selectionStart = selectedRange[0];
      textArea.selectionEnd = selectedRange[1];
    }
  }, [textAreaRef, selectedRange, userDragged]);

  return (
    <StyledMarkdownShortcutsContainer>
      <Bold
        selectedRange={selectedRange}
        textAreaRef={textAreaRef}
        setSelectedRange={setSelectedRange}
        setUserDragged={setUserDragged}
      />
      <List
        selectedRange={selectedRange}
        textAreaRef={textAreaRef}
        setSelectedRange={setSelectedRange}
        setUserDragged={setUserDragged}
      />
      <Link
        selectedRange={selectedRange}
        textAreaRef={textAreaRef}
        setSelectedRange={setSelectedRange}
        setUserDragged={setUserDragged}
      />
    </StyledMarkdownShortcutsContainer>
  );
}

const StyledMarkdownShortcutsContainer = styled.div`
  display: flex;
  height: 20px;
`;
