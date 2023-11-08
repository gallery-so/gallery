import {
  autoUpdate,
  flip,
  inline,
  shift,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { MentionType, useMentionableMessage } from '~/shared/hooks/useMentionableMessage';
import colors from '~/shared/theme/colors';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import IconContainer from '../core/IconContainer';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleS } from '../core/Text/Text';
import { AutoResizingTextAreaWithCharCount } from '../core/TextArea/TextArea';
import { FloatingCard } from '../Mention/FloatingCard';
import { MentionModal } from '../Mention/MentionModal';
import PostComposerNft from './PostComposerNft';

type Props = {
  tokenId: string;
  onBackClick?: () => void;
  eventFlow?: GalleryElementTrackingProps['eventFlow'];
};

const DESCRIPTION_MAX_LENGTH = 600;

export default function PostComposer({ onBackClick, tokenId, eventFlow }: Props) {
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

  const {
    isSelectingMentions,
    aliasKeyword,
    selectMention,
    mentions,
    setMessage,
    message,
    resetMentions,
    handleSelectionChange,
  } = useMentionableMessage();

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement: 'bottom-start',
    open: isSelectingMentions,
    middleware: [flip(), shift(), inline()],
    whileElementsMounted: autoUpdate,
  });

  const headingId = useId();
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([role]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { caption } = usePostComposerContext();

  // if there is caption, set it as the default message
  // for the  share to gallery
  const prevCaption = useRef<string | null>(null);

  useEffect(() => {
    if (prevCaption.current !== caption) {
      prevCaption.current = caption;
      setMessage(caption);
      if (textareaRef.current) {
        const length = textareaRef.current.value.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(length, length);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caption]);

  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      // Ref's `current` property accepts a DOM node
      if (node) {
        textareaRef.current = node;
        reference(node);
      }
    },
    [reference]
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
      context: contexts.Posts,
      flow: eventFlow,
      added_description: Boolean(message),
    });
    try {
      await createPost({
        tokens: [{ dbid: token.dbid, communityId: token.community?.id || '' }],
        caption: message,
        mentions,
      });
      setIsSubmitting(false);
      hideModal();
      pushToast({
        message: `Successfully posted ${token.name || 'item'}`,
      });
      resetMentions();
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof Error) {
        reportError(error);
      }
      setGeneralError('Post failed to upload, please try again');
    }
  }, [
    track,
    eventFlow,
    createPost,
    token.dbid,
    token.community?.id,
    token.name,
    hideModal,
    pushToast,
    reportError,
    mentions,
    message,
    resetMentions,
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

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(event.target.value);
    },
    [setMessage]
  );

  const handleSelectMention = useCallback(
    (item: MentionType) => {
      selectMention(item);

      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
      }
    },
    [selectMention]
  );

  const handleOnSelect = useCallback(
    (event: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
      const target = event.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      handleSelectionChange({ start, end });
    },
    [handleSelectionChange]
  );

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
            <AutoResizingTextAreaWithCharCount
              defaultValue={caption}
              placeholder={`Say something about ${inputPlaceholderTokenName}`}
              currentCharCount={message.length}
              maxCharCount={DESCRIPTION_MAX_LENGTH}
              textAreaHeight="117px"
              onChange={handleDescriptionChange}
              autoFocus
              hasPadding
              value={message}
              ref={setRefs}
              onSelect={handleOnSelect}
              {...getReferenceProps()}
            />

            <AnimatePresence>
              {isSelectingMentions && (
                <FloatingCard
                  className="Popover"
                  headingId={headingId}
                  floatingRef={floating}
                  strategy={strategy}
                  x={x}
                  y={y}
                  getFloatingProps={getFloatingProps}
                >
                  <MentionModal keyword={aliasKeyword} onSelectMention={handleSelectMention} />
                </FloatingCard>
              )}
            </AnimatePresence>
          </VStack>
        </ContentContainer>
      </VStack>
      <StyledHStack justify={generalError ? 'space-between' : 'flex-end'} align="flex-end">
        {generalError && (
          <StyledWrapper>
            <AlertTriangleIcon color={colors.red} />
            <StyledErrorText message={generalError} />
          </StyledWrapper>
        )}
        <Button
          // tracked in click handler
          eventElementId={null}
          eventName={null}
          eventContext={null}
          variant="primary"
          onClick={handlePostClick}
          disabled={isSubmitting || descriptionOverLengthLimit}
        >
          POST
        </Button>
      </StyledHStack>
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

const StyledHStack = styled(HStack)`
  padding-top: 16px;
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
