import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Bold, Link, List } from './Icons';

export default function MarkdownOptions({
  textAreaRef,
  onChange, // The onChange from the TextArea component. This ensures that we track the same event handlers (e.g. a collector's note change) via the addition of just markdown
}: {
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  onChange: (e: React.ChangeEventHandler<HTMLTextAreaElement>) => void;
}) {
  // FIXME: Need some way to trigger parent textarea onChange event
  // Currently a user needs to edit the text after adding Markdown, because markdown itself does not trigger a change event
  // Whenever the textAreaRef.current changes, trigger onChange
  //   useEffect(() => {
  //     if (textAreaRef.current) {
  //       onChange(textAreaRef.current);
  //     }
  //   }, [textAreaRef, onChange]);

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
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.selectionStart = selectedRange[0];
      textArea.selectionEnd = selectedRange[1];
      console.log(textArea);
    }
  }, [textAreaRef, selectedRange]);

  const handleBoldClick = useCallback(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      const [start, end] = selectedRange;
      const selectedText = textArea.value.substring(start, end);
      const selectedTextWithSurrounding = textArea.value.substring(start - 2, end + 2);

      const selectedTextIsBold = selectedText.startsWith('**') && selectedText.endsWith('**');
      const selectedTextIsSurroundedBold =
        selectedTextWithSurrounding.startsWith('**') && selectedTextWithSurrounding.endsWith('**');

      // If the selected text includes any bold tags, remove them
      if (selectedTextIsBold) {
        const newText = textArea.value.replace(selectedText, selectedText.slice(2, -2));
        textArea.value = newText;
        setSelectedRange([start, end - 4]); // **Bold** ([0, 8]) -> Bold ([0, 4])
        return;
      }
      if (selectedTextIsSurroundedBold) {
        const newText = textArea.value.replace(
          selectedTextWithSurrounding,
          selectedTextWithSurrounding.slice(2, -2)
        );
        textArea.value = newText;
        setSelectedRange([start - 2, end - 2]); // **Bold** ([2, 6]) -> Bold ([0, 4])
        return;
      }
      if (selectedText.length > 0) {
        // If the selected text is not already bold, add it
        const newText =
          textArea.value.substring(0, start) +
          `**${selectedText}**` +
          textArea.value.substring(end);
        textArea.value = newText;
        setSelectedRange([start + 2, start + 2 + selectedText.length]); // Bold ([0, 4]) -> **Bold** ([4, 8])
        return;
      }
      if (!selectedText) {
        // If there is no selected text, just add four asterisks where the cursor is and place the cursor in middle
        const newText = textArea.value.substring(0, start) + '****' + textArea.value.substring(end);

        textArea.value = newText;
        setSelectedRange([start + 2, start + 2]); // Bold ([0, 0]) -> **Bold** ([2, 2])
        return;
      }
    }
  }, [textAreaRef, selectedRange]);

  ///////////////////
  // LIST HANDLING //
  ///////////////////
  const handleListClick = useCallback(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      const [start, end] = selectedRange;
      const selectedText = textArea.value.substring(start, end);
      const selectedTextIsList = selectedText.split('\n').every((line) => line.startsWith('*'));

      const lines = selectedText.split('\n');
      const numberOfLines = lines.length;

      // SINGLE LINE: User has either selected one line or is on line but has not selected text
      // If there is no selectedText but the user's cursor is on a line, get the current lines first character
      if (selectedText === '' || lines.length == 1) {
        console.log('dfjans');
        const currentLine =
          textArea.value.split('\n')[textArea.value.substring(0, start).split('\n').length - 1];
        if (currentLine.startsWith('* ')) {
          const newText = textArea.value.replace(currentLine, currentLine.slice(2));
          textArea.value = newText;
          setSelectedRange([start - 2, end - 2]); // * [0, 2] -> [0, 0]
        } else {
          const newText = textArea.value.replace(currentLine, `* ${currentLine}`);
          textArea.value = newText;
          setSelectedRange([start + 2, end + 2]); // Test [0, 3] -> * Test [0, 5]
        }
        return;
      }

      // MULTI LINE SELECTION: User has highlighted text
      // If the selected text includes all list tags, remove them
      if (selectedText) {
        if (selectedTextIsList) {
          const newUnlistedText = lines
            .map((line) => {
              if (line.startsWith('* ')) {
                return line.slice(2);
              }
              return line;
            })
            .join('\n');

          const newText =
            textArea.value.substring(0, start) + newUnlistedText + textArea.value.substring(end);

          textArea.value = newText;
          setSelectedRange([start, end - numberOfLines * 2]); // * List ([0, 8]) -> List ([0, 4])
        } else {
          // If the selected text is not already a list, add it
          // Do this for each line selected
          const newLines = [];
          for (const line of lines) {
            newLines.push(`* ${line}`);
          }
          const newListText = newLines.join('\n');

          const newText =
            textArea.value.substring(0, start) + newListText + textArea.value.substring(end);

          textArea.value = newText;
          setSelectedRange([start, end + numberOfLines * 2]); // List ([0, 4]) -> * List ([2, 6])
        }
      }
    }
  }, [textAreaRef, selectedRange]);

  ///////////////////
  // LINK HANDLING //
  ///////////////////
  const handleLinkClick = useCallback(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      const [start, end] = selectedRange;
      const selectedText = textArea.value.substring(start, end);
      //   const selectedTextWithSurrounding = textArea.value.substring(start - 1, end + 1);

      // FIXME: Removing link tags via a simple click seems excessively complex for the relatively rare use case of someone selecting their entire link and then clicking the link button to "unclick it". I would hold off on this functionality for later, if at all.

      //   const selectedTextIsLink = selectedText.startsWith('[') && selectedText.endsWith(')');
      //   const selectedTextIsSurroundedLink =
      //     selectedTextWithSurrounding.startsWith('[') && selectedTextWithSurrounding.endsWith(']');

      // If the selected text is a link tag, remove it
      //   if (selectedTextIsLink) {
      //     const newText = textArea.value.replace(
      //       selectedText,
      //       selectedText.replace(/\[\]|\[\]/g, '')
      //     );
      //     textArea.value = newText;
      //     setSelectedRange([start, end - 2]); // [Link] ([0, 6]) -> Link ([0, 4])
      //     return;
      //   }
      //     if (selectedTextIsSurroundedLink) {
      //     const newText = textArea.value.replace(
      //       selectedTextWithSurrounding,
      //       selectedText.replace(/\[\]|\[\]/g, '')
      //     );
      //     textArea.value = newText;
      //     setSelectedRange([start - 1, end]); // [Link] ([1, 4]) -> Link ([0, 4])
      //       return;
      //   }

      // If user is inbetween two parens, they probably just clicked the link button. Do nothing
      if (textArea.value.substring(start - 1, end + 1) == '()') {
        return;
      }
      if (selectedText.length > 0) {
        // If the selected text is not already a link, add it
        const newText =
          textArea.value.substring(0, start) +
          `[${selectedText}]()` +
          textArea.value.substring(end);
        textArea.value = newText;
        setSelectedRange([start + 3 + selectedText.length, start + 3 + selectedText.length]); // Link ([0, 4]) -> [Link]() ([6, 6])
        return;
      }
      if (!selectedText) {
        // If there is no selected text, just add a link where the cursor is and place the cursor in middle
        const newText = textArea.value.substring(0, start) + '[]()' + textArea.value.substring(end);
        textArea.value = newText;
        setSelectedRange([start + 1, start + 1]); // [0, 0] -> []() ([1, 1])
        return;
      }
    }
  }, [textAreaRef, selectedRange]);

  return (
    <StyledMarkdownOptionsContainer>
      <Bold onClick={handleBoldClick} />
      <List onClick={handleListClick} />
      <Link onClick={handleLinkClick} />
    </StyledMarkdownOptionsContainer>
  );
}

const StyledMarkdownOptionsContainer = styled.div`
  display: flex;
  position: absolute;
  height: 20px;
  //   bottom: 0;
  //   left: 0;
`;
