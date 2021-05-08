import styled from 'styled-components';
import { Text, Subtitle } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { WizardContext } from 'react-albus';
import { FOOTER_HEIGHT } from '../WizardFooter';

function CreateFirstCollection({ next }: WizardContext) {
  return (
    <StyledCreateFirstCollection>
      <Subtitle size="large">Create your first collection</Subtitle>
      <Spacer height={24} />
      <StyledBodyText>
        Collections are how Gallery groups your NFTs on your profile. Gallery
        supports multiple collections so you can organize your NfTs based on
        themes.
      </StyledBodyText>
      <Spacer height={40} />
      <StyledButton text="New Collection" onClick={next} />
    </StyledCreateFirstCollection>
  );
}

const StyledCreateFirstCollection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - ${FOOTER_HEIGHT}px);
`;

const StyledBodyText = styled(Text)`
  color: ${colors.gray50};
  max-width: 400px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  width: 200px;
`;

export default CreateFirstCollection;
