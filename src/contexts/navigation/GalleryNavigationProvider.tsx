import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { FADE_TRANSITION_TIME_MS } from 'components/FadeTransitioner/FadeTransitioner';
import { useRouter } from 'next/router';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

type GalleryNavigationContextType = { historyStackLength: number; historyStack: string[] };

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

const SCROLL_TRIGGER_TIME_MS =
  FADE_TRANSITION_TIME_MS +
  // this adds an arbirarily small timeframe to ensure the fade transition defined in
  // `FadeTransitioner.tsx` has completed; without this, in rare cases, the user may
  // see a flash of scrolling while transitioning
  20;

export function GalleryNavigationProvider({ children }: Props) {
  const [historyStackLength, setHistoryStackLength] = useState(0);
  const { asPath } = useRouter();
  // This is a flattened list of all the paths the user has visited. Nothing gets popped off, unlike the browser history.
  const [historyStack, setHistoryStack] = useState<string[]>([]);

  const track = useTrack();

  useEffect(() => {
    // history
    setHistoryStack((stack) => [...stack, asPath]);

    // analytics
    track('Page view', { path: asPath });
  }, [asPath, track]);

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
          /**
           * !!! WARNING !!!
           *
           * This is quite possibly one of the worst crimes I've committed to date.
           *
           * THE LONG-TERM PLAN is to have a context that keeps track of the user's
           * scroll position at various pages, and we can toss this file and its window
           * location madness.
           *
           * Now for the explanation....
           *
           * We currently have a hack that overrides the browser's own attempt to
           * place the user at their intended scroll position to prevent jank that
           * coincides with our fade transition.
           *
           * Unfortunately, we end up shooting ourselves in the foot if the user
           * hasn't scrolled at all. If the user doesn't scroll and they navigate
           * to another page, the browser doesn't try to restore their scroll,
           * and we end up overriding the subsequent *active* scroll made by the
           * user themselves. More specifically:
           *   1) User scroll at 0
           *   2) User navigates to another page
           *   3) User arrives at 0
           *   4) User begins scrolling
           *   5) Our hack rejects their scroll, restores scroll back to 0
           *   6) User experiences jank and is thrown back to the top of the page
           *   7) User possibly experiences motion sickness
           *
           * THE FIX: disable our hack if the user is sufficiently close to
           * the top of the page.
           *
           * THE CAVEAT: we don't want to intervene if scrollY is exactly 0, because
           * that signals that the browser is actively pushing the user to the next page,
           * and we DO want to block that default behavior – otherwise the jump occurs
           * before the transition begins. Thus the `window.scrollY > 0` condition.
           */
          if (window.scrollY > 0 && window.scrollY <= 25) {
            window.removeEventListener('scroll', handleScroll);
            return;
          }

          window.scrollTo({ top: scrollY });

          // This exists to delay Next.JS built in scroll restoration.
          //
          // Without this bit, the scroll restoration happens as soon as the
          // animation starts. This means the user will see a scroll event
          // happen even though the previous page hasn't fully been covered
          // by the white overlay.
          //
          // Once the animation kicks off, we want to have the user land
          // at the top of the next page.
          setTimeout(() => {
            window.scrollTo({ top: 0 });
          }, SCROLL_TRIGGER_TIME_MS);

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
        }, SCROLL_TRIGGER_TIME_MS);

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
      historyStack,
    }),
    [historyStackLength, historyStack]
  );

  return (
    <GalleryNavigationContext.Provider value={value}>{children}</GalleryNavigationContext.Provider>
  );
}

export function useCanGoBack() {
  const { historyStackLength } = useGalleryNavigationContext();

  return historyStackLength > 0;
}

export function useHistoryStack() {
  const { historyStack } = useGalleryNavigationContext();

  return historyStack;
}
