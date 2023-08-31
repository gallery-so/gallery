import { useCallback } from 'react';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';

import { Button } from '../core/Button/Button';
import { HStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';

type Props = {
  onSaveDraft: () => void;
  onDiscard: () => void;
};

export default function DiscardPostConfirmation({ onSaveDraft, onDiscard }: Props) {
  const { hideModal } = useModalActions();

  const handleSaveDraftClick = useCallback(() => {
    hideModal();
    onSaveDraft();
  }, [onSaveDraft, hideModal]);

  const handleDiscardConfirmClick = useCallback(() => {
    hideModal();
    onDiscard();
  }, [onDiscard, hideModal]);

  return (
    <StyledConfirmation>
      <BaseM>If you go back now, this post will be discarded.</BaseM>
      <HStack justify="flex-end" gap={8}>
        <StyledButton onClick={handleSaveDraftClick} variant="secondary">
          SAVE DRAFT
        </StyledButton>
        <StyledButton onClick={handleDiscardConfirmClick}>DISCARD</StyledButton>
      </HStack>
    </StyledConfirmation>
  );
}

const StyledConfirmation = styled.div`
  width: 375px;
  max-width: 100%;
`;

const StyledButton = styled(Button)`
  margin-top: 16px;
  padding: 8px 16px;
`;
