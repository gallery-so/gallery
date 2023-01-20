import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { DeleteGalleryConfirmationFragment$key } from '~/generated/DeleteGalleryConfirmationFragment.graphql';

import { Button } from '../core/Button/Button';
import { HStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import useDeleteGallery from './useDeleteGallery';

type Props = {
  galleryRef: DeleteGalleryConfirmationFragment$key;
  isLastGallery: boolean;
  onSuccess: () => void;
};

export default function DeleteGalleryConfirmation({ galleryRef, isLastGallery, onSuccess }: Props) {
  const gallery = useFragment(
    graphql`
      fragment DeleteGalleryConfirmationFragment on Gallery {
        dbid
        hidden
      }
    `,
    galleryRef
  );

  const { dbid: galleryId, hidden } = gallery;

  const { hideModal } = useModalActions();
  const { pushToast } = useToastActions();
  const deleteGallery = useDeleteGallery();

  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmClick = useCallback(() => {
    if (isLastGallery && !hidden) {
      pushToast({
        message: 'You cannot delete your only gallery.',
      });
      return;
    }

    try {
      setIsLoading(true);
      deleteGallery(galleryId);
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        pushToast({
          message: 'Unfortunately there was an error to delete this gallery.',
        });
      }
    } finally {
      setIsLoading(false);
      hideModal();
    }
  }, [deleteGallery, galleryId, hidden, hideModal, isLastGallery, onSuccess, pushToast]);

  return (
    <StyledConfirmation>
      <StyledTextWrapper>
        <BaseM>Are you sure you want to delete this gallery?</BaseM>
      </StyledTextWrapper>
      <HStack justify="flex-end">
        <StyledButton onClick={handleConfirmClick} disabled={isLoading} pending={isLoading}>
          Delete
        </StyledButton>
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
