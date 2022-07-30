import { useModalActions } from 'contexts/modal/ModalContext';
import styled from 'styled-components';
import { Button } from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';

export default function VerifyNavigationPopover({ href }: { href: string }) {
  const { hideModal } = useModalActions();

  return (
    <StyledConfirmation>
      <Spacer height={16} />
      <ButtonContainer>
        <StyledCancelButton onClick={hideModal}>Cancel</StyledCancelButton>
        <StyledButton
          onClick={() => {
            window.open(href);
            hideModal();
          }}
        >
          Navigate
        </StyledButton>
      </ButtonContainer>
    </StyledConfirmation>
  );
}

const StyledConfirmation = styled.div`
  width: 400px;
`;

const StyledButton = styled(Button)`
  width: 80px;
`;

const StyledCancelButton = styled(Button).attrs({ variant: 'secondary' })`
  border: none;
  width: 80px;
  margin-right: 8px;
  color: ${colors.metal};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;
