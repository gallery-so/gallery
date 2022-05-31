import IconContainer from './IconContainer';
import { useCallback } from 'react';
import { setValueAndTriggerOnChange } from './MarkdownShortcuts';

export default function List({
  selectedRange,
  textAreaRef,
}: {
  selectedRange: number[];
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const handleClick = useCallback(() => {
    const textArea = textAreaRef.current;
    if (!textArea) return;

    const [start, end] = selectedRange;
    const selectedText = textArea.value.substring(start, end);

    let allLines = textArea.value.split('\n');

    // Map over each line and store in an array the number of characters in the total string up until that point
    const lineStartIndices = allLines.map((line, index) =>
      allLines.slice(0, index).reduce((acc, curr) => acc + curr.length + 1, 0)
    );

    // Map over allLines and return an object with the existing string and a boolean indicating if it is selected
    const allLinesWithSelected = allLines.map((line, index) => {
      const lineStart = lineStartIndices[index];
      const lineEnd = lineStartIndices[index] + line.length;
      // isSelected is true if the user's selection range includes the start of the line
      const isSelected =
        (lineStart >= start && end >= lineEnd) || (start >= lineStart && start <= lineEnd);
      const isList = line.startsWith('* ');
      return {
        text: line,
        isSelected,
        isList,
      };
    });

    const selectedLines = allLinesWithSelected.filter((line) => line.isSelected);
    const selectedTextIsList = selectedLines.every((line) => line.isList);

    // SINGLE LINE: User has either selected one line or is on line but has not selected text
    // If there is no selectedText but the user's cursor is on a line, get the current lines first character
    if (!selectedText) {
      const currentLineIndex = textArea.value.substring(0, start).split('\n').length - 1;
      const currentLine = textArea.value.split('\n')[currentLineIndex];

      if (currentLine.startsWith('* ')) {
        allLines[currentLineIndex] = allLines[currentLineIndex].slice(2);
        const newText = allLines.join('\n');
        setValueAndTriggerOnChange(textArea, newText, [start - 2, end - 2]); // * [0, 2] -> [0, 0]
      } else {
        // Detect the current lines index, and add the * to the beginning of the line
        allLines[currentLineIndex] = `* ${allLines[currentLineIndex]}`;
        const newText = allLines.join('\n');
        setValueAndTriggerOnChange(textArea, newText, [start + 2, end + 2]); // Test [0, 3] -> * Test [0, 5]
      }
      return;
    }

    // MULTI LINE SELECTION: User has highlighted text
    // If the selected text includes all list tags, remove them
    if (selectedText) {
      if (selectedTextIsList) {
        const newLines = allLinesWithSelected.map((line) => {
          return line.isList && line.isSelected ? line.text.slice(2) : line.text;
        });
        const newText = newLines.join('\n');
        setValueAndTriggerOnChange(textArea, newText, [start - 2, end + selectedLines.length * 2]); // * List ([0, 8]) -> List ([0, 4]);
      } else {
        const newLines = allLinesWithSelected.map((line) => {
          if (line.isSelected) {
            return `* ${line.text}`;
          }
          return line.text;
        });
        const newText = newLines.join('\n');
        setValueAndTriggerOnChange(textArea, newText, [start + 2, end + selectedLines.length * 2]); // List ([0, 4]) -> * List ([2, 6])
      }
    }
  }, [textAreaRef, selectedRange]);

  return (
    <IconContainer
      icon={
        <svg
          data-testid="markdown-icon"
          onClick={handleClick}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" />
          <path d="M9.66669 8.5H17.25" stroke="#141414" stroke-miterlimit="10" />
          <path d="M9.66669 12H17.25" stroke="#141414" stroke-miterlimit="10" />
          <path d="M9.66669 15.5H17.25" stroke="#141414" stroke-miterlimit="10" />
          <path d="M6.75 8.5H7.625" stroke="#141414" />
          <path d="M6.75 12H7.625" stroke="#141414" />
          <path d="M6.75 15.5H7.625" stroke="#141414" />
        </svg>
      }
    />
  );
}
