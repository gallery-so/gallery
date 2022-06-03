import Spacer from 'components/core/Spacer/Spacer';
import styled from 'styled-components';
import { StyledEventText } from './EventDetailsMenu';

export default function EventDetailsSchedule() {
  return (
    <StyledEventDetailsSchedule>
      <StyledEventText>Jun 20</StyledEventText>
      <Spacer height={16} />
      <StyledEventText>10-12AM : MORNING EVENT</StyledEventText>
      <StyledEventText>12-5PM : LOUNGE TIME</StyledEventText>
      <StyledEventText>5-8PM : SPEAKER SERIES</StyledEventText>

      <Spacer height={16} />
      <StyledEventText>Jun 20</StyledEventText>
      <Spacer height={16} />
      <StyledEventText>10-12AM : MORNING EVENT</StyledEventText>
      <StyledEventText>12-5PM : LOUNGE TIME</StyledEventText>
      <StyledEventText>5-8PM : SPEAKER SERIES</StyledEventText>
      <Spacer height={16} />
      <StyledEventText>Jun 20</StyledEventText>
      <Spacer height={16} />
      <StyledEventText>10-12AM : MORNING EVENT</StyledEventText>
      <StyledEventText>12-5PM : LOUNGE TIME</StyledEventText>
      <StyledEventText>5-8PM : SPEAKER SERIES</StyledEventText>
    </StyledEventDetailsSchedule>
  );
}

const StyledEventDetailsSchedule = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
