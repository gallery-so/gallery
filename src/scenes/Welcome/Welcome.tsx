import { useCallback } from 'react';
import { navigate, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import { Text } from 'components/core/Text/Text';
import PrimaryButton from 'components/core/Button/PrimaryButton';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';

function Welcome(_: RouteComponentProps) {
  const handleClick = useCallback(() => {
    navigate('/create');
  }, []);

  return (
    <StyledWelcome>
      <StyledHeader>Welcome to Gallery</StyledHeader>
      <StyledBodyText>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation
      </StyledBodyText>
      <Spacer height={20} />
      <StyledPrimaryButton text="Enter Gallery" onClick={handleClick} />
    </StyledWelcome>
  );
}

const StyledHeader = styled.p`
  text-align: center;
  color: black;
  font-size: 50px;
  white-space: nowrap;
  margin-bottom: 24px;
`;

const StyledBodyText = styled(Text)`
  margin-bottom: 24px;
  color: ${colors.gray50};
`;

const StyledWelcome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 140px;
  width: min-content;
  margin: 20vh auto 0;
`;

const StyledPrimaryButton = styled(PrimaryButton)`
  width: 200px;
`;

export default Welcome;
