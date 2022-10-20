import { createContext, CSSProperties, memo, Suspense, useMemo } from 'react';
import { CSSTransition, TransitionGroup, TransitionStatus } from 'react-transition-group';

import { FullPageLoaderWithLayoutTransitionSupport } from 'components/core/Loader/FullPageLoader';
import { useRouter } from 'next/router';

type Props = {
  locationKey?: string;
  children: React.ReactNode;
};

// NOTE: if you change these values, make sure to update `transition.css`
export const FADE_TRANSITION_TIME_MS = 300;
export const NAVIGATION_TRANSITION_TIME_MS = 700;

const timeoutConfig = {
  enter: FADE_TRANSITION_TIME_MS + NAVIGATION_TRANSITION_TIME_MS,
  exit: FADE_TRANSITION_TIME_MS,
};

const childNodeStyles = {
  width: '100%',
  height: '100%',
};

export const TransitionStateContext = createContext<TransitionStatus | undefined>(undefined);

/**
 * Fades child elements in and out as they mount/unmount.
 *
 * This file is tightly coupled with `transition.css`, specifically
 * around timing + classNames. More info: https://reactjs.org/docs/animation.html
 */
function FadeTransitioner({ locationKey, children }: Props) {
  return (
    <TransitionGroup>
      <CSSTransition key={locationKey} timeout={timeoutConfig} classNames="fade">
        {(state) => {
          // Placing the Suspense boundary here (within the TransitionGroup) allows the scroll position
          // to remain uninterrupted upon navigation
          return (
            <TransitionStateContext.Provider value={state}>
              <div style={childNodeStyles as CSSProperties}>
                <Suspense fallback={<FullPageLoaderWithLayoutTransitionSupport />}>
                  {children}
                </Suspense>
              </div>
            </TransitionStateContext.Provider>
          );
        }}
      </CSSTransition>
    </TransitionGroup>
  );
}

/**
 * Stabilizes the location key in certain scenarios to avoid triggering the Fade Transition animation
 */
export function useStabilizedRouteTransitionKey() {
  const { asPath, pathname, query } = useRouter();

  const transitionAnimationKey = useMemo(() => {
    // if we're looking at the NFT detail modal from the user gallery page,
    // keep the location key static as to not trigger an animation
    if (pathname === '/[username]' && query.modal === 'true') {
      return `/${query.username}`;
    }
    // same logic for modal triggered from collection page
    if (pathname === '/[username]/[collectionId]' && query.modal === 'true') {
      return `/${query.username}/${query.collectionId}`;
    }
    // keep location stable for NFT detail pages
    if (pathname === '/[username]/[collectionId]/[tokenId]') {
      return `/${query.username}/${query.collectionId}`;
    }
    return asPath;
  }, [asPath, pathname, query]);

  return transitionAnimationKey;
}

export default memo(FadeTransitioner);
