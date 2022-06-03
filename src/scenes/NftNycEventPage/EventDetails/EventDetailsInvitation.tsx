import Spacer from 'components/core/Spacer/Spacer';
import styled from 'styled-components';
import { StyledEventText } from './EventDetailsMenu';

export default function EventDetailsInvitation() {
  return (
    <StyledEventDetailsInvitation>
      <StyledEventText>Members Only</StyledEventText>
      <StyledEventText>214 Lafayette</StyledEventText>
      <Spacer height={16} />
      <StyledEventText>All day lounge</StyledEventText>
      <StyledEventText>Jun 20-22</StyledEventText>
      <Spacer height={16} />
      <StyledEventText>Wear what you want</StyledEventText>
    </StyledEventDetailsInvitation>
  );
}

const StyledEventDetailsInvitation = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
