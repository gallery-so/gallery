import colors from 'components/core/colors';
import { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import EventDetailsInvitation from './EventDetailsInvitation';
import EventDetailsMenu from './EventDetailsMenu';
import EventDetailsSchedule from './EventDetailsSchedule';

export const INVITATION = Symbol('INVITATION');
export const SCHEDULE = Symbol('SCHEDULE');
export const VENUE = Symbol('VENUE');

export type MenuState = typeof INVITATION | typeof SCHEDULE | typeof VENUE;

export default function NftNycDetails() {
  const [menuState, setMenuState] = useState<MenuState>(INVITATION);

  const EventDetailsContent = useMemo(() => {
    switch (menuState) {
      case INVITATION:
        return <EventDetailsInvitation />;
      case SCHEDULE:
        return <EventDetailsSchedule />;
    }
  }, [menuState]);

  return (
    <StyledNftNycDetails>
      <StyledContentWrapper>
        <EventDetailsMenu menuState={menuState} setMenuState={setMenuState} />
        {EventDetailsContent}
      </StyledContentWrapper>
    </StyledNftNycDetails>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; };
  to { opacity: 1; };
`;

const StyledNftNycDetails = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  background: ${colors.offBlack};
  padding: 24px;

  h2,
  p {
    color: ${colors.offWhite};
  }
`;

const StyledContentWrapper = styled.div`
  opacity: 0;
  height: 100%;
  width: 100%;
  display: flex;
  animation: ${fadeIn} 800ms cubic-bezier(0, 0, 0.4, 1) 800ms;
  animation-fill-mode: forwards;
`;
