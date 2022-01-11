import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { FADE_TIME_MS } from 'components/FadeTransitioner/FadeTransitioner';

type GalleryNavigationContextType = { historyStackLength: number };

const GalleryNavigationContext = createContext<GalleryNavigationContextType | undefined>(undefined);

function useGalleryNavigationContext() {
  const value = useContext(GalleryNavigationContext);

  if (!value) {
    throw new Error('Missing GalleryNavigationContext somewhere above this component.');
  }

  return value;
}

type Props = {
  children: ReactNode;
};

export function GalleryNavigationProvider({ children }: Props) {
  const [historyStackLength, setHistoryStackLength] = useState(0);

  useEffect(() => {
    const originalPushState = window.history.pushState;

    window.history.pushState = (...args) => {
      // This function is here to fix a scroll jank issue with the TransitionGroups
      // Scroll restoration from Next.JS seems to work fine out of the box without
      // the transition group. Upon a transition, the scroll position jumps to the top
      // of the page even though the height hasn't changed.
      //
      // To solve the above issue, upon a navigation push
      // We get the current scroll position (the correct one), and then
      // we listen for the jank scroll (this should happen exactly once)
      // We then scroll back to the saved scroll position caught a few ms ago.
      function setupScrollJankFix() {
        let scrollY = window.scrollY;

        function handleScroll() {
          window.scrollTo({ top: scrollY });

          scrollY = window.scrollY;

          window.removeEventListener('scroll', handleScroll);
        }

        window.addEventListener('scroll', handleScroll);
      }

      setupScrollJankFix();
      originalPushState.bind(window.history)(...args);
      setHistoryStackLength(window.history.state.idx ?? 0);
    };

    function handlePopState() {
      const originalScrollTo = window.scrollTo;

      // This part exists to delay Next.JS built in scroll restoration.
      //
      // Without this bit, the scroll restoration happens as soon as the
      // animation starts. This means the user will see a scroll event
      // happen even though the previous page hasn't fully been covered
      // by the white overlay.
      //
      // We can fix this by intercepting the Next.JS scroll restoration
      // when they call popState, and delaying the actual call until
      // the animation is where we want it to be.
      // @ts-expect-error We're getting too raw here
      window.scrollTo = (...args) => {
        setTimeout(() => {
          // @ts-expect-error We're getting too raw here
          originalScrollTo(...args);
        }, FADE_TIME_MS);

        window.scrollTo = originalScrollTo;
      };

      setHistoryStackLength(window.history.state.idx ?? 0);
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const value = useMemo<GalleryNavigationContextType>(
    () => ({
      historyStackLength,
    }),
    [historyStackLength]
  );

  return (
    <GalleryNavigationContext.Provider value={value}>{children}</GalleryNavigationContext.Provider>
  );
}

export function useCanGoBack() {
  const { historyStackLength } = useGalleryNavigationContext();

  return historyStackLength > 0;
}
