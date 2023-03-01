import { useEffect } from 'react';

// type Props = {
//   ref: React.RefObject<HTMLElement>;
//   callback: () => void;
// };

export default function useDetectOutsideClick(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [callback, ref]);
}
