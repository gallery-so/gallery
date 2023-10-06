import { useCallback } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';

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
        <StyledButton
          // TODO: these should be passed in from parent
          eventElementId={null}
          eventName={null}
          onClick={handleClick}
        >
          {buttonText}
        </StyledButton>
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
