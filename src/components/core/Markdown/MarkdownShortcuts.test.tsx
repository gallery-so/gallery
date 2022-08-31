import { fireEvent, render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import MarkdownShortcuts from './MarkdownShortcuts';
import { useEffect, useRef } from 'react';

function MarkdownShortcutsWithTextArea() {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      console.log(ref.current.selectionStart); // FIXME: This is always 0. How to update ref.current.selectionStart?
    }
  }, [ref]);

  return (
    <>
      <textarea id="textarea" data-testid="textarea" ref={ref}></textarea>
      <MarkdownShortcuts textAreaRef={ref} />
    </>
  );
}

describe('MarkdownShortcuts', () => {
  it('should render icons', () => {
    const { getAllByTestId } = render(<MarkdownShortcutsWithTextArea />);
    expect(getAllByTestId('markdown-icon').length).toBe(3);
  });

  // Bold functionality
  it('should bold elements', () => {
    const { getAllByTestId } = render(<MarkdownShortcutsWithTextArea />);

    const boldIcon = getAllByTestId('markdown-icon')[0];
    fireEvent.click(boldIcon);

    const message = screen.getByDisplayValue('****');
    expect(message).toBeTruthy();
  });

  //   it('should append bold asterisks around selected text', () => {
  //     const { getByTestId, getAllByTestId } = render(<MarkdownShortcutsWithTextArea />);

  //     // const textArea = getByTestId('textarea');
  //     const textArea = getByTestId('textarea') as HTMLTextAreaElement;
  //     const boldIcon = getAllByTestId('markdown-icon')[0];

  //     // Add text to the text area
  //     // textArea.value = 'Hello World';
  //     fireEvent.change(textArea, { target: { value: 'Hello World' } });

  //     // Select text from range 6 to 11
  //     // FIXME: This does not apply a selection range to the ref.current, asterisks are applied before text
  //     textArea.focus();
  //     textArea.setSelectionRange(6, 11);

  //     expect(textArea.value.slice(textArea.selectionStart, textArea.selectionEnd)).toBe('World');
  //     console.log(textArea.value.slice(textArea.selectionStart, textArea.selectionEnd));

  //     fireEvent.click(boldIcon);

  //     // Check if the text is bold
  //     // IS FAILING:
  //     // const message = screen.getByDisplayValue('Hello **World**');
  //     // expect(message).toBeTruthy();
  //   });

  it('should create list element', () => {
    const { getAllByTestId } = render(<MarkdownShortcutsWithTextArea />);

    const listIcon = getAllByTestId('markdown-icon')[1];
    fireEvent.click(listIcon);

    const message = screen.getByDisplayValue('*');
    expect(message).toBeTruthy();
  });

  it('should create link', () => {
    const { getAllByTestId } = render(<MarkdownShortcutsWithTextArea />);

    const linkIcon = getAllByTestId('markdown-icon')[2];
    fireEvent.click(linkIcon);

    const message = screen.getByDisplayValue('[](https://)');
    expect(message).toBeTruthy();
  });
});
