import {
  ClipboardEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFragment } from 'react-relay';
import { ConnectionHandler, graphql, SelectorStoreUpdater } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import { SendButton } from '~/components/Feed/Socialize/SendButton';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { CommentBoxFragment$key } from '~/generated/CommentBoxFragment.graphql';
import { CommentBoxMutation } from '~/generated/CommentBoxMutation.graphql';
import { CommentBoxQueryFragment$key } from '~/generated/CommentBoxQueryFragment.graphql';
import { AuthModal } from '~/hooks/useAuthModal';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import colors from '~/shared/theme/colors';

const MAX_TEXT_LENGTH = 100;

type Props = {
  eventRef: CommentBoxFragment$key;
  queryRef: CommentBoxQueryFragment$key;
};

export function CommentBox({ eventRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CommentBoxQueryFragment on Query {
        viewer {
          __typename
          ... on Viewer {
            user {
              id
              dbid
              username
              profileImage {
                ... on TokenProfileImage {
                  token {
                    dbid
                    id
                    ...getVideoOrImageUrlForNftPreviewFragment
                  }
                }
              }
            }
          }
        }
        ...useAuthModalFragment
      }
    `,
    queryRef
  );

  const event = useFragment(
    graphql`
      fragment CommentBoxFragment on FeedEvent {
        id
        dbid
      }
    `,
    eventRef
  );

  const [submitComment, isSubmittingComment] = usePromisifiedMutation<CommentBoxMutation>(graphql`
    mutation CommentBoxMutation($eventId: DBID!, $comment: String!, $connections: [ID!]!)
    @raw_response_type {
      commentOnFeedEvent(comment: $comment, feedEventId: $eventId) {
        ... on CommentOnFeedEventPayload {
          __typename

          comment @appendNode(connections: $connections, edgeTypeName: "FeedEventCommentEdge") {
            dbid
            ...CommentLineFragment
            ...CommentNoteFragment
          }
        }
      }
    }
  `);

  // WARNING: calling `setValue` will not cause the textarea's content to actually change
  // It's simply there as a state value that we can reference to peek into the current state
  // of the textarea.
  //
  // We don't flush the state of `value` back out to the textarea to avoid constantly having
  // to move the user's cursor around while their typing. This would cause a pretty jarring
  // typing experience.
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLParagraphElement | null>(null);

  const { pushToast } = useToastActions();
  const reportError = useReportError();
  const track = useTrack();
  const { showModal } = useModalActions();

  const resetInputState = useCallback(() => {
    setValue('');

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.innerText = '';
    }
  }, []);

  const hasProfileImage = useMemo(() => {
    if (query?.viewer?.__typename !== 'Viewer') {
      return false;
    }
    return query.viewer?.user?.profileImage?.token != null;
  }, [query.viewer]);

  const handleSubmit = useCallback(async () => {
    if (query.viewer?.__typename !== 'Viewer') {
      showModal({
        content: <AuthModal queryRef={query} />,
        headerText: 'Sign In',
      });

      return;
    }

    if (isSubmittingComment || value.length === 0) {
      return;
    }

    function pushErrorToast() {
      pushToast({
        autoClose: true,
        message: "Something went wrong while posting your comment. We're looking into it.",
      });
    }

    track('Save Comment Click');

    try {
      const interactionsConnection = ConnectionHandler.getConnectionID(
        event.id,
        'Interactions_comments'
      );
      const commentsModalConnection = ConnectionHandler.getConnectionID(
        event.id,
        'CommentsModal_interactions'
      );

      const updater: SelectorStoreUpdater<CommentBoxMutation['response']> = (store, response) => {
        if (response.commentOnFeedEvent?.__typename === 'CommentOnFeedEventPayload') {
          const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
        }
      };

      const optimisticId = Math.random().toString();

      const { token } = query.viewer?.user?.profileImage ?? {};

      const result = token
        ? getVideoOrImageUrlForNftPreview({
            tokenRef: token,
          })
        : null;

      const tokenProfileImagePayload = hasProfileImage
        ? {
            token: {
              dbid: token?.dbid ?? 'unknown',
              id: token?.id ?? 'unknown',
              media: {
                __typename: 'ImageMedia',
                fallbackMedia: {
                  mediaURL: result?.urls?.small ?? null,
                },
                previewURLs: {
                  large: result?.urls?.large ?? null,
                  medium: result?.urls?.medium ?? null,
                  small: result?.urls?.small ?? null,
                },
              },
            },
          }
        : { token: null };

      const response = await submitComment({
        updater,
        optimisticUpdater: updater,
        optimisticResponse: {
          commentOnFeedEvent: {
            __typename: 'CommentOnFeedEventPayload',
            comment: {
              __typename: 'Comment',
              comment: value,
              commenter: {
                dbid: query.viewer?.user?.dbid ?? 'unknown',
                id: query.viewer?.user?.id ?? 'unknown',
                username: query.viewer?.user?.username ?? null,
                profileImage: {
                  __typename: 'TokenProfileImage',
                  ...tokenProfileImagePayload,
                },
              },
              creationTime: new Date().toISOString(),
              dbid: optimisticId,
              id: `Comment:${optimisticId}`,
            },
          },
        },
        variables: {
          comment: value,
          eventId: event.dbid,
          connections: [interactionsConnection, commentsModalConnection],
        },
      });

      if (response.commentOnFeedEvent?.__typename === 'CommentOnFeedEventPayload') {
        resetInputState();
      } else {
        pushErrorToast();

        reportError(
          `Error while commenting on feed event, typename was ${response.commentOnFeedEvent?.__typename}`
        );
      }
    } catch (error) {
      pushErrorToast();

      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError('An unexpected error occurred while posting a comment.');
      }
    }
  }, [
    event.dbid,
    event.id,
    hasProfileImage,
    isSubmittingComment,
    pushToast,
    query,
    showModal,
    reportError,
    resetInputState,
    submitComment,
    track,
    value,
  ]);

  const handleInputKeyDown = useCallback<KeyboardEventHandler>(
    async (event) => {
      if (event.key === 'Enter' && event.metaKey) {
        await handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const nextValue = textarea.innerText ?? '';

    // If the user tried typing / pasting something over 100 characters of length
    // we need to trim the content down, override the text content in the element
    // and then put their cursor back at the end of the element
    if (nextValue.length > MAX_TEXT_LENGTH) {
      const nextValueSliced = nextValue.slice(0, 100);
      textarea.textContent = nextValueSliced;

      const range = document.createRange();
      const selection = window.getSelection();

      // Not really sure why `selection` is nullable
      // Maybe because other browsers don't support this API
      if (!selection) {
        return;
      }

      const childNode = textarea.childNodes[0];

      // There should only ever be a single child node
      if (!childNode) {
        return;
      }

      range.setStart(childNode, MAX_TEXT_LENGTH);
      range.setEnd(childNode, MAX_TEXT_LENGTH);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      setValue(nextValueSliced);
    } else {
      setValue(nextValue);
    }
  }, []);

  // This prevents someone from pasting a styled element into the textbox
  const handlePaste = useCallback<ClipboardEventHandler<HTMLParagraphElement>>(
    (event) => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');

      // This is deprecated but will work forever because browsers
      document.execCommand('insertHTML', false, text);

      handleInput();
    },
    [handleInput]
  );

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <Wrapper>
      <InputWrapper gap={12}>
        {/* Purposely not using a controlled input here to avoid cursor jitter */}
        <Textarea
          onPaste={handlePaste}
          onKeyDown={handleInputKeyDown}
          ref={textareaRef}
          onInput={handleInput}
        />

        <HStack gap={12} align="center">
          <BaseM color={colors.metal}>{MAX_TEXT_LENGTH - value.length}</BaseM>
          <SendButton enabled={value.length > 0 && !isSubmittingComment} onClick={handleSubmit} />
        </HStack>
      </InputWrapper>
    </Wrapper>
  );
}

const InputWrapper = styled(HStack)`
  width: 100%;
  height: 100%;

  max-height: 150px;
  overflow-y: auto;

  ::-webkit-scrollbar {
    display: none;
  }

  padding: 0 8px;

  background-color: ${colors.faint};
`;

const Textarea = styled(BaseM).attrs({
  role: 'textbox',
  contentEditable: 'true',
})`
  min-width: 0;
  font-family: ${BODY_FONT_FAMILY};

  cursor: text;

  width: 100%;
  min-height: 20px;

  resize: both;

  color: ${colors.metal};

  padding: 8px 64px 8px 0;

  :focus {
    outline: none;
    color: ${colors.black['800']};
  }
`;

const Wrapper = styled.div`
  // Full width with 16px of padding on either side
  width: 100%;

  border-top: 1px solid ${colors.porcelain};

  background: ${colors.white};

  padding: 16px;
`;
