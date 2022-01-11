import { useCallback, MouseEvent } from 'react';
import { useRouter } from 'next/router';

// navigates to the given url. Opens in new tab if meta key (command on mac) is pressed
export function useNavigateToUrl() {
  const { push } = useRouter();

  return useCallback(
    (url: string, event: MouseEvent<HTMLElement>) => {
      if (event.metaKey || event.ctrlKey) {
        window.open(url);
      } else {
        void push(url);
      }
    },
    [push]
  );
}
