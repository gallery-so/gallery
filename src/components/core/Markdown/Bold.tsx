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
    const selectedTextWithSurrounding = textArea.value.substring(start - 2, end + 2);

    const selectedTextIsBold = selectedText.startsWith('**') && selectedText.endsWith('**');
    const selectedTextIsSurroundedBold =
      selectedTextWithSurrounding.startsWith('**') && selectedTextWithSurrounding.endsWith('**');

    // If the selected text includes any bold tags, remove them
    if (selectedTextIsBold) {
      const newText =
        textArea.value.substring(0, start) +
        selectedText.slice(2, -2) +
        textArea.value.substring(end);
      setValueAndTriggerOnChange(textArea, newText, [start, end - 4]); // **Bold** ([0, 8]) -> Bold ([0, 4])
      return;
    }
    if (selectedTextIsSurroundedBold) {
      const newText =
        textArea.value.substring(0, start - 2) +
        selectedTextWithSurrounding.slice(2, -2) +
        textArea.value.substring(end + 2);
      setValueAndTriggerOnChange(textArea, newText, [start - 2, end - 2]); // **Bold** ([2, 6]) -> Bold ([0, 4])
      return;
    }
    if (selectedText.length > 0) {
      // If the selected text is not already bold, add it
      const newText = `${textArea.value.substring(
        0,
        start
      )}**${selectedText}**${textArea.value.substring(end)}`;
      setValueAndTriggerOnChange(textArea, newText, [start + 2, start + 2 + selectedText.length]); // Bold ([0, 4]) -> **Bold** ([4, 8])
      return;
    }
    if (!selectedText) {
      // If there is no selected text, just add four asterisks where the cursor is and place the cursor in middle
      const newText = textArea.value.substring(0, start) + '****' + textArea.value.substring(end);

      setValueAndTriggerOnChange(textArea, newText, [start + 2, start + 2]); // Bold ([0, 0]) -> **Bold** ([2, 2])
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
            d="M14.7277 7.24799C14.1566 6.76028 13.3771 6.5251 12.4068 6.5251H8.6001H8.5251V6.6001V17.0001V17.0751H8.6001H12.5241C13.5627 17.0751 14.3919 16.8252 14.9927 16.3073L14.9927 16.3073C15.6038 15.7791 15.9071 15.0735 15.9071 14.2054C15.9071 13.5163 15.6797 12.9155 15.226 12.41C14.8815 12.0177 14.4477 11.7329 13.9284 11.5541C14.3825 11.374 14.754 11.1156 15.0381 10.7764C15.4137 10.3277 15.5991 9.78115 15.5991 9.14543C15.5991 8.37169 15.3079 7.7352 14.7277 7.24799ZM9.33643 7.29243H12.4068C13.1778 7.29243 13.7577 7.4738 14.164 7.8169L14.164 7.8169L14.1648 7.81753C14.5703 8.15097 14.7731 8.58907 14.7731 9.14543C14.7731 9.76305 14.5585 10.2509 14.1323 10.6227L14.1323 10.6227L14.1317 10.6232C13.7151 10.9945 13.1311 11.1891 12.3628 11.1891H9.33643V7.29243ZM9.33643 11.9564H12.3628C13.1789 11.9564 13.8294 12.1648 14.3266 12.5699L14.3271 12.5703C14.8289 12.9718 15.0811 13.512 15.0811 14.2054C15.0811 14.8751 14.8644 15.3857 14.441 15.7554C14.0166 16.1163 13.3851 16.3078 12.5241 16.3078H9.33643V11.9564Z"
            fill="#141414"
            stroke="black"
            strokeWidth="0.15"
          />
        </svg>
      }
    />
  );
}
