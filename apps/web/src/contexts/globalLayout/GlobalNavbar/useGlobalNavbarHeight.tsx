// import { useEffect, useState } from 'react';

// const INITIAL_HEIGHT = 64;

export function useGlobalNavbarHeight() {
  return 64;
  // TODO: unclear what this logic was for; toss if no longer necessary
  //
  // const [height, setHeight] = useState(INITIAL_HEIGHT);

  // useEffect(() => {
  //   if (!global.ResizeObserver) {
  //     return;
  //   }

  //   const observer = new ResizeObserver((entries) => {
  //     const [entry] = entries;

  //     if (!entry) {
  //       return;
  //     }

  //     console.log('setting', entry.borderBoxSize?.[0]?.blockSize);

  //     setHeight(entry.borderBoxSize?.[0]?.blockSize ?? INITIAL_HEIGHT);
  //   });

  //   const element = document.querySelector('.GlobalNavbar');

  //   if (element) {
  //     observer.observe(element);
  //   }
  // }, []);

  // return height;
}
