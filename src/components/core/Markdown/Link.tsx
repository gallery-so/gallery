import IconContainer from './IconContainer';
import { useCallback } from 'react';
import { setValueAndTriggerOnChange } from './MarkdownShortcuts';

export default function Bold({
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

    // If the user clicks an empty link, remove the [](https://)
    if (textArea.value.substring(start - 1, end + 11) === '[](https://)') {
      const newText =
        textArea.value.substring(0, start - 1) +
        textArea.value.substring(end + 11, textArea.value.length);
      setValueAndTriggerOnChange(textArea, newText, [start - 1, start - 1]);
      return;
    }
    // If user is at the end of (https://), they probably just clicked the link button.
    // Removing the [text](https://) would be difficult because [text] can be any number of chars. For now, just return
    if (textArea.value.substring(start - 1, end + 1) == '/)') {
      return;
    }
    if (selectedText.length > 0) {
      // If the user has selected text, add a link around it
      const newText =
        textArea.value.substring(0, start) +
        `[${selectedText}](https://)` +
        textArea.value.substring(end);
      setValueAndTriggerOnChange(textArea, newText, [
        start + 11 + selectedText.length,
        start + 11 + selectedText.length,
      ]); // Link [0, 4] -> [Link](https://) (end)
      return;
    }
    if (!selectedText) {
      // If there is no selected text, just add a link where the cursor is and place the cursor in middle
      const newText =
        textArea.value.substring(0, start) + '[](https://)' + textArea.value.substring(end);
      setValueAndTriggerOnChange(textArea, newText, [start + 1, start + 1]); // [0, 0] -> []() ([1, 1])
      return;
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
          <path
            d="M9.33335 8.6665H8.00002C7.11597 8.6665 6.26812 9.01769 5.643 9.64281C5.01788 10.2679 4.66669 11.1158 4.66669 11.9998C4.66669 12.8839 5.01788 13.7317 5.643 14.3569C6.26812 14.982 7.11597 15.3332 8.00002 15.3332H9.33335"
            stroke="#141414"
          />
          <path d="M8.66669 12H15.3334" stroke="#141414" />
          <path
            d="M14.6667 15.3332H16C16.8841 15.3332 17.7319 14.982 18.357 14.3569C18.9822 13.7317 19.3334 12.8839 19.3334 11.9998C19.3334 11.1158 18.9822 10.2679 18.357 9.64281C17.7319 9.01769 16.8841 8.6665 16 8.6665H14.6667"
            stroke="#141414"
          />
        </svg>
      }
    />
  );
}
