import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleM } from 'components/core/Text/Text';
import { useCallback } from 'react';
import styled from 'styled-components';
import { INVITATION, MenuState, SCHEDULE } from './EventDetailsPage';

type Props = {
  menuState: MenuState;
  setMenuState: (menuState: MenuState) => void;
};

export default function EventDetailsMenu({ menuState, setMenuState }: Props) {
  const handleMenuButtonClick = useCallback(
    (menuState: MenuState) => {
      setMenuState(menuState);
    },
    [setMenuState]
  );

  return (
    <StyledEventDetailsMenu>
      <TitleM>
        <strong>G</strong>
      </TitleM>
      <TitleM>nft.nyc 2022</TitleM>
      <Spacer height={24} />
      <StyledMenuButton onClick={() => handleMenuButtonClick(INVITATION)}>
        <StyledMenuText active={menuState === INVITATION}>The Invitation</StyledMenuText>
      </StyledMenuButton>
      <StyledMenuButton onClick={() => handleMenuButtonClick(SCHEDULE)}>
        <StyledMenuText active={menuState === SCHEDULE}>The Schedule</StyledMenuText>
      </StyledMenuButton>
    </StyledEventDetailsMenu>
  );
}

const StyledEventDetailsMenu = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: baseline;
  width: 300px;
`;

export const StyledEventText = styled(BaseM)`
  font-weight: 600;
  text-transform: uppercase;
`;

const StyledMenuText = styled(StyledEventText)<{ active: boolean }>`
  ${({ active }) =>
    active &&
    `
  &:after {
    content: ')';
    padding-left: 12px;
  }

  &:before {
    content: '(';
    padding-right: 12px;
  }
  `}
`;

const StyledMenuButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`;
