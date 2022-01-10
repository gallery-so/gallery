import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

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
