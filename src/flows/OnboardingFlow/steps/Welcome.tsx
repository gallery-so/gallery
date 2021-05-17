import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import { Display, BodyRegular } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';

function Welcome({ next }: WizardContext) {
  return (
    <FullPageCenteredStep>
      <Display>Welcome to Gallery</Display>
      <Spacer height={8} />
      <StyledBodyText color={colors.gray50}>
        This is your space to share your pieces and the stories that surround
        them. Curate, arrange, and display your collection exactly how it was
        meant to be.
      </StyledBodyText>
      <Spacer height={16} />
      <StyledButton text="Enter Gallery" onClick={next} />
    </FullPageCenteredStep>
  );
}

const StyledBodyText = styled(BodyRegular)`
  max-width: 400px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  width: 200px;
`;

export default Welcome;
