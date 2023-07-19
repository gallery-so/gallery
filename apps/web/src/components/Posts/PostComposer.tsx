import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { PostComposerFragment$key } from '~/generated/PostComposerFragment.graphql';
import useCreatePost from '~/hooks/api/posts/useCreatePost';
import { ChevronLeftIcon } from '~/icons/ChevronLeftIcon';

import { Button } from '../core/Button/Button';
import IconContainer from '../core/IconContainer';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleS } from '../core/Text/Text';
import { TextAreaWithCharCount } from '../core/TextArea/TextArea';
import PostComposerNft from './PostComposerNft';

type Props = {
  onBackClick?: () => void;
  tokenRef: PostComposerFragment$key;
};

const DESCRIPTION_MAX_LENGTH = 600;

export default function PostComposer({ onBackClick, tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment PostComposerFragment on Token {
        __typename
        dbid
        name
        ...PostComposerNftFragment
      }
    `,
    tokenRef
  );

  const [description, setDescription] = useState('');
  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  }, []);

  const createPost = useCreatePost();

  const { hideModal } = useModalActions();
  const { pushToast } = useToastActions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostClick = useCallback(async () => {
    setIsSubmitting(true);
    await createPost({
      tokenIds: [token.dbid],
      caption: description,
    });
    setIsSubmitting(false);
    pushToast({
      message: `Successfully posted ${token.name || 'item'}`,
    });
    hideModal();
  }, [createPost, description, hideModal, pushToast, token.dbid, token.name]);

  const handleBackClick = useCallback(() => {
    onBackClick?.();
  }, [onBackClick]);

  return (
    <StyledPostComposer grow justify="space-between">
      <VStack gap={24}>
        <StyledHeader align="center" gap={8}>
          {onBackClick && (
            <IconContainer
              onClick={handleBackClick}
              variant="default"
              size="sm"
              icon={<ChevronLeftIcon />}
            />
          )}
          <TitleS>New post</TitleS>
        </StyledHeader>
        <HStack gap={16}>
          <PostComposerNft tokenRef={token} onBackClick={handleBackClick} />
          <VStack grow>
            <TextAreaWithCharCount
              currentCharCount={description.length}
              maxCharCount={DESCRIPTION_MAX_LENGTH}
              placeholder="Add a description"
              textAreaHeight="117px"
              onChange={handleDescriptionChange}
              autoFocus
              hasPadding
            />
          </VStack>
        </HStack>
      </VStack>
      <HStack justify="flex-end" align="flex-end">
        <Button variant="primary" onClick={handlePostClick} disabled={isSubmitting}>
          POST
        </Button>
      </HStack>
    </StyledPostComposer>
  );
}

const StyledPostComposer = styled(VStack)`
  height: 100%;
`;

const StyledHeader = styled(HStack)`
  padding-top: 16px;
`;
