import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import ErrorText from '~/components/core/Text/ErrorText';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { usePostComposerContext } from '~/contexts/postComposer/PostComposerContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { PostComposerQuery } from '~/generated/PostComposerQuery.graphql';
import { PostComposerTokenFragment$key } from '~/generated/PostComposerTokenFragment.graphql';
import useCreatePost from '~/hooks/api/posts/useCreatePost';
import AlertTriangleIcon from '~/icons/AlertTriangleIcon';
import { ChevronLeftIcon } from '~/icons/ChevronLeftIcon';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import colors from '~/shared/theme/colors';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import IconContainer from '../core/IconContainer';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleS } from '../core/Text/Text';
import { TextAreaWithCharCount } from '../core/TextArea/TextArea';
import PostComposerNft from './PostComposerNft';

type Props = {
  tokenId: string;
  onBackClick?: () => void;
};

const DESCRIPTION_MAX_LENGTH = 600;

export default function PostComposer({ onBackClick, tokenId }: Props) {
  const query = useLazyLoadQuery<PostComposerQuery>(
    graphql`
      query PostComposerQuery($tokenId: DBID!) {
        tokenById(id: $tokenId) {
          ... on Token {
            __typename
            ...PostComposerTokenFragment
          }
        }
      }
    `,
    { tokenId }
  );

  if (query.tokenById?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const token = useFragment<PostComposerTokenFragment$key>(
    graphql`
      fragment PostComposerTokenFragment on Token {
        dbid
        name
        community {
          id
        }
        ...PostComposerNftFragment
      }
    `,
    query.tokenById
  );

  const { caption, setCaption, captionRef } = usePostComposerContext();

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCaption(event.target.value);
    },
    [setCaption]
  );

  const descriptionOverLengthLimit = caption.length > DESCRIPTION_MAX_LENGTH;

  const createPost = useCreatePost();

  const { hideModal } = useModalActions();
  const { pushToast } = useToastActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const track = useTrack();
  const [generalError, setGeneralError] = useState('');
  const reportError = useReportError();

  const handlePostClick = useCallback(async () => {
    setIsSubmitting(true);
    track('Clicked Post in Post Composer', {
      added_description: Boolean(captionRef.current),
    });
    try {
      await createPost({
        tokens: [{ dbid: token.dbid, communityId: token.community?.id || '' }],
        caption: captionRef.current,
      });
      setIsSubmitting(false);
      hideModal();
      pushToast({
        message: `Successfully posted ${token.name || 'item'}`,
      });
      setCaption('');
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof Error) {
        reportError(error);
      }
      setGeneralError('Post failed to upload, please try again');
    }
  }, [
    track,
    captionRef,
    createPost,
    token.dbid,
    token.community?.id,
    token.name,
    hideModal,
    pushToast,
    setCaption,
    reportError,
  ]);

  const handleBackClick = useCallback(() => {
    onBackClick?.();
  }, [onBackClick]);

  const inputPlaceholderTokenName = useMemo(() => {
    if (!token.name || token.name.length > 30) {
      return 'this item';
    }
    return `"${token.name}"`;
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
              defaultValue={caption}
              placeholder={`Say something about ${inputPlaceholderTokenName}`}
              currentCharCount={caption.length}
              maxCharCount={DESCRIPTION_MAX_LENGTH}
              textAreaHeight="117px"
              onChange={handleDescriptionChange}
              autoFocus
              hasPadding
            />
          </VStack>
        </ContentContainer>
      </VStack>
      <HStack justify={generalError ? 'space-between' : 'flex-end'} align="flex-end">
        {generalError && (
          <StyledWrapper>
            <AlertTriangleIcon color={colors.red} />
            <StyledErrorText message={generalError} />
          </StyledWrapper>
        )}
        <Button
          eventElementId="Submit Post Button"
          eventName="Submit Post"
          eventContext={contexts.Posts}
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

const StyledErrorText = styled(ErrorText)`
  color: ${colors.red};
`;

const StyledWrapper = styled(HStack)`
  display: flex;
  height: 100%;
  gap: 4px;
  align-items: center;
`;
