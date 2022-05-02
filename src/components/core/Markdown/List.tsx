import IconContainer from './IconContainer';
import { useCallback } from 'react';

export default function Bold({
  selectedRange,
  textAreaRef,
  setSelectedRange,
}: {
  selectedRange: number[];
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  setSelectedRange: (value: number[] | ((prevVar: number[]) => number[])) => void;
}) {
  const handleClick = useCallback(() => {
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
  }, [textAreaRef, selectedRange, setSelectedRange]);

  return (
    <IconContainer
      icon={
        <svg
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
