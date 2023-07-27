import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';

import { Button } from '../core/Button/Button';
import { HStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';

type Props = {
  onClick: () => void;
};

export default function DiscardPostConfirmation({ onClick }: Props) {
  const { hideModal } = useModalActions();

  const handleConfirmClick = () => {
    onClick();
    hideModal();
  };

  return (
    <StyledConfirmation>
      <StyledTextWrapper>
        <BaseM>Are you sure?</BaseM>
      </StyledTextWrapper>
      <BaseM>If you go back now, this post will be discarded</BaseM>
      <HStack justify="flex-end">
        <StyledButton onClick={handleConfirmClick}>DISCARD POST</StyledButton>
      </HStack>
    </StyledConfirmation>
  );
}

const StyledConfirmation = styled.div`
  width: 311px;
  max-width: 100%;
  padding-top: 16px;
`;

const StyledTextWrapper = styled.div`
  padding: 16px 0;
`;

const StyledButton = styled(Button)`
  width: 77px;
`;
