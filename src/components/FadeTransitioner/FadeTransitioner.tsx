import { CSSProperties, memo } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './transition.css';

import { fullPageHeightWithoutFooter } from 'components/core/Page/Page';
import { useNavigationContext } from 'contexts/navigation/NavigationContext';

type Props = {
  locationKey?: string;
  children: React.ReactNode;
};

// NOTE: if you change these, make sure to update `transition.css`
const FADE_TIME_MS = 300;
export const NAVIGATION_TRANSITION_TIME_MS = 700;

const timeoutConfig = {
  enter: FADE_TIME_MS + NAVIGATION_TRANSITION_TIME_MS,
  exit: FADE_TIME_MS,
};

const childNodeStyles = {
  width: '100%',
};

const transitionGroupStyles = { minHeight: fullPageHeightWithoutFooter };

/**
 * Fades child elements in and out as they mount/unmount.
 *
 * This file is tightly coupled with `transition.css`, specifically
 * around timing + classNames. More info: https://reactjs.org/docs/animation.html
 */
function FadeTransitioner({ locationKey = '', children }: Props) {
  const { handleNavigation } = useNavigationContext();

  return (
    <TransitionGroup style={transitionGroupStyles}>
      <CSSTransition
        key={locationKey}
        timeout={timeoutConfig}
        classNames="fade"
        onExit={handleNavigation}>
        <div style={childNodeStyles as CSSProperties}>{children}</div>
      </CSSTransition>
    </TransitionGroup>
  );
}

export default memo(FadeTransitioner);
