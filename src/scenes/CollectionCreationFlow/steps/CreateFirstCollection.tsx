import styled from 'styled-components';
import { Text, Subtitle } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { WizardContext } from 'react-albus';

function CreateFirstCollection({ next }: WizardContext) {
  return (
    <StyledWelcome>
      <Subtitle size="large">Create your first collection</Subtitle>
      <Spacer height={20} />
      <StyledBodyText>
        Collections are how Gallery groups your NFTs on your profile. Gallery
        supports multiple collections so you can organize your NfTs based on
        themes.
      </StyledBodyText>
      <Spacer height={20} />
      <StyledButton text="New Collection" onClick={next} />
    </StyledWelcome>
  );
}

const StyledBodyText = styled(Text)`
  margin-bottom: 24px;
  color: ${colors.gray50};
  text-align: center;
`;

const StyledWelcome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 140px;
  margin: 20vh auto 0;
  max-width: 400px;
`;

const StyledButton = styled(Button)`
  width: 200px;
`;

export default CreateFirstCollection;
