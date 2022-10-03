import { BaseM } from 'components/core/Text/Text';
import breakpoints from 'components/core/breakpoints';
import { Button } from 'components/core/Button/Button';
import styled from 'styled-components';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useCallback } from 'react';
import { VStack } from 'components/core/Spacer/Stack';

export default function GenericActionModal({
  action,
  bodyText,
  buttonText,
}: {
  action: () => void;
  bodyText?: string;
  buttonText: string;
}) {
  const { hideModal } = useModalActions();

  const handleClick = useCallback(() => {
    action();
    hideModal();
  }, [action, hideModal]);

  return (
    <StyledModal>
      <LeaveWrapper gap={16}>
        <BaseM>{bodyText}</BaseM>
        <StyledButton onClick={handleClick}>{buttonText}</StyledButton>
      </LeaveWrapper>
    </StyledModal>
  );
}

const StyledModal = styled.div`
  height: 100%;
  width: 300px;
  @media only screen and ${breakpoints.tablet} {
    width: 480px;
  }
`;

const StyledButton = styled(Button)`
  padding: 0px 12px;
  height: 30px;
  align-self: flex-end;
`;

const LeaveWrapper = styled(VStack)`
  justify-content: center;
  justify-content: center;
  place-items: center;
  height: 100%;
`;
