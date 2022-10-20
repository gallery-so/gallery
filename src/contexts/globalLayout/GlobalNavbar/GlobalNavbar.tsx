import { memo, ReactElement } from 'react';
import styled from 'styled-components';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

export type Props = {
  content: ReactElement | null;
};

function GlobalNavbar({ content }: Props) {
  const transitionKey = content?.type.toString();

  return (
    <StyledGlobalNavbar className="GlobalNavbar" data-testid="navbar">
      <TransitionGroup>
        <CSSTransition key={transitionKey} timeout={300} classNames="navbar-fade">
          {content ?? <></>}
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
