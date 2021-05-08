import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import { Text } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';

function Welcome({ next }: WizardContext) {
  return (
    <StyledWelcome>
      <StyledHeader>Welcome to Gallery</StyledHeader>
      <Spacer height={24} />
      <StyledBodyText>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation
      </StyledBodyText>
      <Spacer height={40} />
      <StyledButton text="Enter Gallery" onClick={next} />
    </StyledWelcome>
  );
}

const StyledWelcome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const StyledHeader = styled.p`
  text-align: center;
  color: black;
  font-size: 50px;
  white-space: nowrap;

  margin: 0;
`;

const StyledBodyText = styled(Text)`
  color: ${colors.gray50};
  width: 400px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  width: 200px;
`;

export default Welcome;
