import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { PostComposerFragment$key } from '~/generated/PostComposerFragment.graphql';
import useCreatePost from '~/hooks/api/posts/useCreatePost';
import { ChevronLeftIcon } from '~/icons/ChevronLeftIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

import breakpoints from '../core/breakpoints';
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
        community {
          id
        }
        ...PostComposerNftFragment
      }
    `,
    tokenRef
  );

  const [description, setDescription] = useState('');
  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  }, []);

  const descriptionOverLengthLimit = useMemo(() => {
    return description.length > DESCRIPTION_MAX_LENGTH;
  }, [description]);

  const createPost = useCreatePost();

  const { hideModal } = useModalActions();
  const { pushToast } = useToastActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const track = useTrack();
  const router = useRouter();

  const handlePostClick = useCallback(async () => {
    setIsSubmitting(true);
    track('Clicked Post in Post Composer', {
      added_description: !!description,
    });
    try {
      // if posted token belongs to current community, dont redirect

      // otherwise redirect to latest feed

      await createPost({
        tokens: [{ dbid: token.dbid, communityId: token.community.id }],
        caption: description,
      });
      // router.push('/latest');
    } catch (error) {
      // TODO add error state GAL-3841
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    pushToast({
      message: `Successfully posted ${token.name || 'item'}`,
    });
    hideModal();
  }, [
    createPost,
    description,
    hideModal,
    pushToast,
    token.community.id,
    token.dbid,
    token.name,
    track,
  ]);

  const handleBackClick = useCallback(() => {
    onBackClick?.();
  }, [onBackClick]);

  const inputPlaceholderTokenName = useMemo(() => {
    if (!token.name || token.name.length > 30) {
      return 'this item';
    }
    return `"${token.name}`;
  }, [token.name]);

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
        <ContentContainer>
          <PostComposerNft tokenRef={token} />
          <VStack grow>
            <TextAreaWithCharCount
              currentCharCount={description.length}
              maxCharCount={DESCRIPTION_MAX_LENGTH}
              placeholder={`Say something about ${inputPlaceholderTokenName}`}
              textAreaHeight="117px"
              onChange={handleDescriptionChange}
              autoFocus
              hasPadding
            />
          </VStack>
        </ContentContainer>
      </VStack>
      <HStack justify="flex-end" align="flex-end">
        <Button
          variant="primary"
          onClick={handlePostClick}
          disabled={isSubmitting || descriptionOverLengthLimit}
        >
          POST
        </Button>
      </HStack>
    </StyledPostComposer>
  );
}

const StyledPostComposer = styled(VStack)`
  height: 100%;
  padding: 16px;

  @media only screen and ${breakpoints.tablet} {
    padding: 0;
  }
`;

const StyledHeader = styled(HStack)`
  padding-top: 16px;
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column-reverse;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }
`;
