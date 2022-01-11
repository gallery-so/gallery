import { CSSProperties, memo, Suspense } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { fullPageHeightWithoutNavbarAndFooter } from 'components/core/Page/constants';
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
};

const transitionGroupStyles = {
  minHeight: fullPageHeightWithoutNavbarAndFooter,
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
        <Suspense fallback={<FullPageLoader />}>
          <div style={childNodeStyles as CSSProperties}>{children}</div>
        </Suspense>
      </CSSTransition>
    </TransitionGroup>
  );
}

export default memo(FadeTransitioner);
