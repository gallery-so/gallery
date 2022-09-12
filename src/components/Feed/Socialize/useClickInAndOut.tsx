import { MutableRefObject, useEffect } from 'react';

export type ClickLocation = 'exact' | 'inside' | 'outside';

export function useClickInAndOut(
  ref: MutableRefObject<HTMLElement | null>,
  handleEvent: (clickLocation: ClickLocation) => void
) {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.target === ref.current) {
        handleEvent('exact');
      } else if (event.target instanceof Node && ref.current?.contains(event.target)) {
        handleEvent('inside');
      } else {
        handleEvent('outside');
      }
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [handleEvent, ref]);
}
