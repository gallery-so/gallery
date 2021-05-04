import styled from 'styled-components';
import Button from 'components/core/Button/Button';
import { Subtitle, Text } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

export default function Header() {
  return (
    <StyledHeader>
      <TitleContainer>
        <Subtitle>Organize your Gallery</Subtitle>
      </TitleContainer>
      <OptionsContainer>
        <Text>Preview Gallery</Text>
        <Spacer width={16} />
        <StyledButton type="secondary" text="+ Add Collection" />
      </OptionsContainer>
    </StyledHeader>
  );
}

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const OptionsContainer = styled.div`
  display: flex;
  align-items: center;

  text-transform: uppercase;
`;

const StyledButton = styled(Button)`
  padding: 10px 16px;
`;
