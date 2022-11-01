import { memo, ReactElement, Suspense } from 'react';
import styled from 'styled-components';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

export type Props = {
  content: ReactElement | null;
};

function GlobalNavbar({ content }: Props) {
  const transitionKey = content?.type?.toString();

  return (
    <StyledGlobalNavbar className="GlobalNavbar" data-testid="navbar">
      <TransitionGroup>
        <CSSTransition key={transitionKey} timeout={500} classNames="navbar-fade">
          {/* We need a Suspense fallback here as not to trigger the root suspense boundary
          Anything else will end up fucking with React Transition Group's internal state
          and we'll get double navbars :(*/}
          <Suspense fallback={null}>{content ?? <></>}</Suspense>
        </CSSTransition>
      </TransitionGroup>
    </StyledGlobalNavbar>
  );
}

const StyledGlobalNavbar = styled.div`
  width: 100%;

  // TODO: standardize these settings
  background: rgba(254, 254, 254, 0.95);
  backdrop-filter: blur(48px);

  position: fixed;
  z-index: 3;
`;

export default memo(GlobalNavbar);
