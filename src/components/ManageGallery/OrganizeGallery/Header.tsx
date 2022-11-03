import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';

type Props = {
  onAddCollection: () => void;
};

export default function Header({ onAddCollection }: Props) {
  return (
    <StyledHeader>
      <TitleContainer>
        <TitleDiatypeL>Collections</TitleDiatypeL>
        <BaseM>Drag to re-order collections</BaseM>
      </TitleContainer>
      <OptionsContainer>
        <Button variant="secondary" onClick={onAddCollection}>
          Add
        </Button>
      </OptionsContainer>
    </StyledHeader>
  );
}

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  width: 100%;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const OptionsContainer = styled.div`
  display: flex;
  align-items: center;

  text-transform: uppercase;
`;
