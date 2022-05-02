import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Bold from './Bold';
import Link from './Link';
import List from './List';

export default function MarkdownOptions({
  textAreaRef,
  onChange, // The onChange from the TextArea component. This ensures that we track the same event handlers (e.g. a collector's note change) via the addition of just markdown
}: {
  // textAreaRef:
  //   | React.MutableRefObject<HTMLTextAreaElement>
  //   | ((instance: HTMLTextAreaElement | null) => void);
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}) {
  // FIXME: Need some way to trigger parent textarea onChange event
  // Currently a user needs to edit the text after adding Markdown, because markdown itself does not trigger a change event
  // Whenever the textAreaRef.current changes, trigger onChange
  //   useEffect(() => {
  //     if (textAreaRef.current) {
  //       onChange(textAreaRef.current);
  //     }
  //   }, [textAreaRef, onChange]);

  console.log(onChange);

  // Rather than select the text, we select the range of select characters; this will prevent multiple instances of the same text getting same Markdown applied
  const [selectedRange, setSelectedRange] = useState([
    textAreaRef?.current?.selectionStart || 0,
    textAreaRef?.current?.selectionEnd || 0,
  ]);

  // Anytime the user selects new text, setSelectedRange to equal the indexes of that text
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      const onSelectionChange = () => {
        setSelectedRange([textArea.selectionStart, textArea.selectionEnd]);
      };
      textArea.addEventListener('selectionchange', onSelectionChange);
      return () => {
        textArea.removeEventListener('selectionchange', onSelectionChange);
      };
    }
  }, [textAreaRef]);

  // Whenever selectedRange updates, set the textarea.current.selectionStart and selectionEnd to match
  // This means that we can apply markdown to selected text, but preserve selection afterwards
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.selectionStart = selectedRange[0];
      textArea.selectionEnd = selectedRange[1];
    }
  }, [textAreaRef, selectedRange]);

  return (
    <StyledMarkdownOptionsContainer>
      <Bold
        selectedRange={selectedRange}
        textAreaRef={textAreaRef}
        setSelectedRange={setSelectedRange}
      />
      <List
        selectedRange={selectedRange}
        textAreaRef={textAreaRef}
        setSelectedRange={setSelectedRange}
      />
      <Link
        selectedRange={selectedRange}
        textAreaRef={textAreaRef}
        setSelectedRange={setSelectedRange}
      />
    </StyledMarkdownOptionsContainer>
  );
}

const StyledMarkdownOptionsContainer = styled.div`
  display: flex;
  position: absolute;
  place-items: center;
  height: 20px;
  bottom: 80px;
`;
