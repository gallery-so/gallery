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
      <Subtitle>Create your first collection</Subtitle>
      <Spacer height={8} />
      <StyledBodyText>
        Organize your gallery with collections. Use them to group NFTs by
        creator, theme, or anything that feels right.
      </StyledBodyText>
      <Spacer height={24} />
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
  max-width: 390px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  width: 200px;
`;

export default CreateFirstCollection;
