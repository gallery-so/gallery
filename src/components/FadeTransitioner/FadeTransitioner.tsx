import { CSSProperties, memo, useCallback, useEffect, useRef } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './transition.css';

import { fullPageHeightWithoutFooter } from 'components/core/Page/Page';
import { createHistory, globalHistory } from '@reach/router';

type Props = {
  nodeKey?: string;
  children: React.ReactNode;
};

// NOTE: if you change these, make sure to update `transition.css`
const FADE_TIME_MS = 300;
const TRANSITION_TIME_MS = 700;

const timeoutConfig = {
  enter: FADE_TIME_MS + TRANSITION_TIME_MS,
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

function FadeTransitioner({ nodeKey = '', children }: Props) {
  const previousScrollPosition = useRef(window.scrollY);

  useEffect(() => {
    previousScrollPosition.current = window.scrollY;
  }, [nodeKey]);

  const navigationAction = useRef('');

  useEffect(() => {
    globalHistory.listen(({ action }) => {
      navigationAction.current = action;
    });
  }, []);

  // console.log(history);

  const handleExit = useCallback(() => {
    console.log('exiting');
    const maintainScrollPosition = navigationAction.current === 'POP';
    // console.log(window.location.pathname);
    const previousPosition = previousScrollPosition.current;
    setTimeout(() => {
      if (maintainScrollPosition) {
        console.log('maintaining scroll position');
        window.scrollTo({ top: previousPosition });
        return;
      }

      console.log('scrolling to top');
      window.scrollTo({ top: 0 });
    }, TRANSITION_TIME_MS);
  }, []);

  return (
    <TransitionGroup style={transitionGroupStyles}>
      <CSSTransition key={nodeKey} timeout={timeoutConfig} classNames="fade" onExit={handleExit}>
        <div style={childNodeStyles as CSSProperties}>{children}</div>
      </CSSTransition>
    </TransitionGroup>
  );
}

export default memo(FadeTransitioner);

// Edit Gallery scroll:200 => Profile scroll:0

// Profile scroll:200 => NFT Detail scroll:0 => scroll:200
