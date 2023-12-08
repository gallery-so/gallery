import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { MODAL_PADDING_PX } from '~/contexts/modal/constants';
import { useModalActions } from '~/contexts/modal/ModalContext';
import colors from '~/shared/theme/colors';

import { VStack } from '../Spacer/Stack';
import { BaseM } from '../Text/Text';

export default function VerifyNavigationPopover({
  href,
  onClickThrough,
}: {
  href: string;
  onClickThrough: () => void;
}) {
  const { hideModal } = useModalActions();

  return (
    <StyledConfirmation gap={16}>
      <TextContainer>
        <StyledBaseM>
          Confirm that you are navigating to: <b>{href}</b>
        </StyledBaseM>
      </TextContainer>
      <ButtonContainer>
        <StyledCancelButton
          eventElementId="Leave Gallery Navigation Cancel Button"
          eventName="Cancel Leave Gallery"
          eventContext={null}
          onClick={() => hideModal()}
        >
          Cancel
        </StyledCancelButton>
        <Button
          eventElementId="Leave Gallery Navigation Confirmation Button"
          eventName="Confirm Leave Gallery"
          eventContext={null}
          properties={{ externalLink: href }}
          onClick={() => {
            onClickThrough();
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
const StyledConfirmation = styled(VStack)`
  width: min(calc(100vw - ${MODAL_PADDING_PX * 4}px), 400px);
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
