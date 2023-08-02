import { useCallback } from 'react';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';

import { Button } from '../core/Button/Button';
import { HStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';

type Props = {
  onDiscard: () => void;
};

export default function DiscardPostConfirmation({ onDiscard }: Props) {
  const { hideModal } = useModalActions();

  const handleDiscardConfirmClick = useCallback(() => {
    hideModal();
    onDiscard();
  }, [onDiscard, hideModal]);

  return (
    <StyledConfirmation>
      <BaseM>If you go back now, this post will be discarded.</BaseM>
      <HStack justify="flex-end">
        <StyledButton onClick={handleDiscardConfirmClick}>DISCARD POST</StyledButton>
      </HStack>
    </StyledConfirmation>
  );
}

const StyledConfirmation = styled.div`
  width: 311px;
  max-width: 100%;
`;

const StyledButton = styled(Button)`
  margin-top: 16px;
  width: 120px;
  padding-left: 0px;
  padding-right: 0px;
`;
