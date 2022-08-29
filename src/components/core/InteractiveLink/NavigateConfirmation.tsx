import { useModalActions } from 'contexts/modal/ModalContext';
import styled from 'styled-components';
import { Button } from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from '../Text/Text';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';

export default function VerifyNavigationPopover({ href }: { href: string }) {
  const { hideModal } = useModalActions();

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <StyledConfirmation isMobile={isMobile}>
      <TextContainer>
        <StyledBaseM>
          Confirm that you are navigating to: Confirm that you are navigating to: Confirm that you
          are navigating to: Confirm that you are navigating to: <b>{href}</b>
        </StyledBaseM>
      </TextContainer>
      <Spacer height={16} />
      <ButtonContainer>
        <StyledCancelButton onClick={() => hideModal()}>Cancel</StyledCancelButton>
        <Button
          onClick={() => {
            window.open(href);
            hideModal();
          }}
        >
          Navigate
        </Button>
      </ButtonContainer>
    </StyledConfirmation>
  );
}

// TODO: maybe the width should be set when triggering the modal, as opposed to this component
const StyledConfirmation = styled.div<{ isMobile: boolean }>`
  width: ${({ isMobile }) => (isMobile ? 'unset' : '400px')};
`;

const TextContainer = styled.div`
  display: block;
`;

const StyledBaseM = styled(BaseM)`
  word-break: break-all;
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
