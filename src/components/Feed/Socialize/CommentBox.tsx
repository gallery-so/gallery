import styled, { css } from 'styled-components';
import colors from 'components/core/colors';
import {
  ClipboardEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SendButton } from 'components/Feed/Socialize/SendButton';
import { BaseM, BODY_FONT_FAMILY } from 'components/core/Text/Text';
import { HStack } from 'components/core/Spacer/Stack';
import { useFragment } from 'react-relay';
import { ConnectionHandler, graphql, SelectorStoreUpdater } from 'relay-runtime';
import { CommentBoxFragment$key } from '../../../../__generated__/CommentBoxFragment.graphql';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { CommentBoxMutation } from '../../../../__generated__/CommentBoxMutation.graphql';
import { CommentBoxQueryFragment$key } from '../../../../__generated__/CommentBoxQueryFragment.graphql';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';

const MAX_TEXT_LENGTH = 100;

type Props = {
  active: boolean;
  onClose: () => void;
  eventRef: CommentBoxFragment$key;
  queryRef: CommentBoxQueryFragment$key;
  onPotentialLayoutShift: () => void;
};

export function CommentBox({ active, onClose, eventRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CommentBoxQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
              username
            }
          }
        }
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

  const resetInputState = useCallback(() => {
    setValue('');

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.innerText = '';
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmittingComment || value.length === 0) {
      return;
    }

    function pushErrorToast() {
      pushToast({
        autoClose: true,
        message: "Something went wrong while posting your comment. We're looking into it.",
      });
    }

    try {
      const interactionsConnection = ConnectionHandler.getConnectionID(
        event.id,
        'Interactions_comments'
      );
      const notesModalConnection = ConnectionHandler.getConnectionID(
        event.id,
        'NotesModal_interactions'
      );

      const updater: SelectorStoreUpdater<CommentBoxMutation['response']> = (store, response) => {
        if (response.commentOnFeedEvent?.__typename === 'CommentOnFeedEventPayload') {
          const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
        }
      };

      const optimisticId = Math.random().toString();
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
                id: query.viewer?.user?.id ?? 'unknown',
                username: query.viewer?.user?.username ?? null,
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
          connections: [interactionsConnection, notesModalConnection],
        },
      });

      if (response.commentOnFeedEvent?.__typename === 'CommentOnFeedEventPayload') {
        resetInputState();

        onClose();
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
    isSubmittingComment,
    onClose,
    pushToast,
    query.viewer?.user?.id,
    query.viewer?.user?.username,
    reportError,
    resetInputState,
    submitComment,
    value,
  ]);

  useEffect(() => {
    if (active) {
      textareaRef.current?.focus();
    }
  }, [active]);

  const handleClick = useCallback<MouseEventHandler<HTMLElement>>((event) => {
    event.stopPropagation();
  }, []);

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

  return (
    <>
      {active && <ClickPreventingOverlay onClick={onClose} />}
      <CommentBoxWrapper active={active}>
        <Wrapper onClick={handleClick}>
          <InputWrapper gap={12}>
            {/* Purposely not using a controlled input here to avoid cursor jitter */}
            <Textarea
              onPaste={handlePaste}
              onKeyDown={handleInputKeyDown}
              ref={textareaRef}
              onInput={handleInput}
            />

            <ControlsContainer gap={12} align="center">
              <BaseM color={colors.metal}>{MAX_TEXT_LENGTH - value.length}</BaseM>
              <SendButton
                enabled={value.length > 0 && !isSubmittingComment}
                onClick={handleSubmit}
              />
            </ControlsContainer>
          </InputWrapper>
        </Wrapper>
      </CommentBoxWrapper>
    </>
  );
}

const ClickPreventingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  // Higher than whole page / header
  z-index: 10;
`;

const CommentBoxWrapper = styled.div<{ active: boolean }>`
  width: 375px;

  position: absolute;
  bottom: 0;
  right: 0;

  // Higher than the Overlay
  z-index: 11;

  transition: transform 300ms ease-out, opacity 300ms ease-in-out;

  ${({ active }) =>
    active
      ? css`
          opacity: 1;
          transform: translateY(calc(100% + 8px));
        `
      : css`
          opacity: 0;
          pointer-events: none;
          transform: translateY(100%);
        `}
`;

const ControlsContainer = styled(HStack)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 16px;
`;

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

  width: 100%;
  min-height: 20px;

  resize: both;

  color: ${colors.metal};

  padding: 6px 64px 6px 0;

  :focus {
    outline: none;
    color: ${colors.offBlack};
  }
`;

const Wrapper = styled.div`
  position: relative;
  width: 100%;

  border: 1px solid ${colors.offBlack};

  background: ${colors.white};

  padding: 8px;
`;
