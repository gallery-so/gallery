import { useEffect } from 'react';

export default function useConfirmationMessageBeforeClose() {
  useEffect(() => {
    const message =
      'Are you sure you want to quit editing the collection? You have unsaved changes.';
    const savedOnBeforeUnload = window.onbeforeunload;

    window.onbeforeunload = (e) => {
      // Doing both `returnValue` and `return` here as a recommendation from this StackOverflow post
      // https://stackoverflow.com/questions/10311341/confirmation-before-closing-of-tab-browser
      e.returnValue = message;

      return message;
    };

    return () => {
      window.onbeforeunload = savedOnBeforeUnload;
    };
  }, []);
}
