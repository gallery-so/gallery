import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import useDeletePost from '~/hooks/api/posts/useDeletePost';

type Props = {
  postId: string;
};

export default function DeletePostConfirmation({ postId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const deletePost = useDeletePost();
  const { hideModal } = useModalActions();

  const handleConfirmClick = useCallback(async () => {
    setIsLoading(true);
    try {
      await deletePost(postId);
    } catch (error) {
      return;
    }
    setIsLoading(false);
    hideModal();
  }, [deletePost, hideModal, postId]);
  return (
    <VStack gap={16}>
      <VStack>
        <BaseM>Are you sure you want to delete this post?</BaseM>
        <BaseM>This cannot be undone.</BaseM>
      </VStack>
      <HStack justify="flex-end">
        <StyledButton onClick={handleConfirmClick} disabled={isLoading} pending={isLoading}>
          Delete
        </StyledButton>
      </HStack>
    </VStack>
  );
}

const StyledButton = styled(Button)`
  width: 80px;
`;
