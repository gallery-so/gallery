import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import { Display, BodyRegular } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';

function Welcome({ next }: WizardContext) {
  return (
    <StyledWelcome>
      <Display>Welcome to Gallery</Display>
      <Spacer height={24} />
      <StyledBodyText color={colors.gray50}>
        This is your space to share your pieces and and the stories that
        surround them. Curate, arrange, and display your collection exactly how
        it was meant to be.
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

const StyledBodyText = styled(BodyRegular)`
  max-width: 400px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  width: 200px;
`;

export default Welcome;
