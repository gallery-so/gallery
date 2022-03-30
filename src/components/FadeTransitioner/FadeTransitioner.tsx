import { CSSProperties, memo, Suspense } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import FullPageLoader from 'components/core/Loader/FullPageLoader';

type Props = {
  locationKey?: string;
  children: React.ReactNode;
};

// NOTE: if you change these, make sure to update `transition.css`
export const FADE_TIME_MS = 300;
export const NAVIGATION_TRANSITION_TIME_MS = 700;

const timeoutConfig = {
  enter: FADE_TIME_MS + NAVIGATION_TRANSITION_TIME_MS,
  exit: FADE_TIME_MS,
};

const childNodeStyles = {
  width: '100%',
  height: '100%',
};

const transitionGroupStyles = {
  // NOTE: this doesn't seem to do anything. in the future we could use this to only transition
  // the inner content of a page, while leaving the navbar + footer visible.
  // minHeight: fullPageHeightWithoutNavbarAndFooter,
};

/**
 * Fades child elements in and out as they mount/unmount.
 *
 * This file is tightly coupled with `transition.css`, specifically
 * around timing + classNames. More info: https://reactjs.org/docs/animation.html
 */
function FadeTransitioner({ locationKey, children }: Props) {
  return (
    <TransitionGroup style={transitionGroupStyles}>
      <CSSTransition key={locationKey} timeout={timeoutConfig} classNames="fade">
        {/* Placing the Suspense boundary here (within the TransitionGroup) allows the scroll position
            to remain uninterrupted upon navigation */}
        <div style={childNodeStyles as CSSProperties}>
          <FullPageLoader />
          {/* <Suspense fallback={<FullPageLoader />}>{children}</Suspense> */}
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
}

export default memo(FadeTransitioner);
