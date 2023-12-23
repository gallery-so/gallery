import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { DeleteCommentConfirmationFragment$key } from '~/generated/DeleteCommentConfirmationFragment.graphql';
import { useDeleteComment } from '~/hooks/api/posts/useDeleteComment';
import { contexts } from '~/shared/analytics/constants';

type Props = {
  commentRef: DeleteCommentConfirmationFragment$key;
};

export default function DeleteCommentConfirmation({ commentRef }: Props) {
  const comment = useFragment(
    graphql`
      fragment DeleteCommentConfirmationFragment on Comment {
        __typename
        ...useDeleteCommentFragment
      }
    `,
    commentRef
  );

  const { deleteComment } = useDeleteComment({
    commentRef: comment,
  });

  const [isLoading, setIsLoading] = useState(false);
  const { hideModal } = useModalActions();

  const handleConfirmClick = useCallback(async () => {
    setIsLoading(true);
    try {
      await deleteComment();
    } catch (error) {
      return;
    } finally {
      setIsLoading(false);
      hideModal();
    }
  }, [deleteComment, hideModal]);

  return (
    <StyledWrapper gap={16}>
      <VStack>
        <BaseM>Are you sure you want to delete this comment?</BaseM>
      </VStack>
      <HStack justify="flex-end">
        <StyledButton
          eventElementId="Delete Comment Button"
          eventName="Click Delete Comment Button"
          eventContext={contexts.Posts}
          onClick={handleConfirmClick}
          disabled={isLoading}
          pending={isLoading}
        >
          Delete
        </StyledButton>
      </HStack>
    </StyledWrapper>
  );
}

const StyledWrapper = styled(VStack)`
  width: 375px;
  max-width: 100%;
`;

const StyledButton = styled(Button)`
  width: 80px;
`;
