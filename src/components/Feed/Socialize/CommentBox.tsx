import styled, { css } from 'styled-components';
import colors from 'components/core/colors';
import { MouseEventHandler, useCallback, useRef, useState } from 'react';
import { SendButton } from 'components/Feed/Socialize/SendButton';
import { BaseM, BODY_FONT_FAMILY } from 'components/core/Text/Text';
import { HStack } from 'components/core/Spacer/Stack';
import { useFragment } from 'react-relay';
import { ConnectionHandler, graphql } from 'relay-runtime';
import { CommentBoxFragment$key } from '../../../../__generated__/CommentBoxFragment.graphql';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { CommentBoxMutation } from '../../../../__generated__/CommentBoxMutation.graphql';
import { CommentBoxQueryFragment$key } from '../../../../__generated__/CommentBoxQueryFragment.graphql';

const MAX_TEXT_LENGTH = 100;

type Props = {
  active: boolean;
  onClose: () => void;
  eventRef: CommentBoxFragment$key;
  queryRef: CommentBoxQueryFragment$key;
  onPotentialLayoutShift: () => void;
};

export function CommentBox({ active, onClose, eventRef, queryRef, onPotentialLayoutShift }: Props) {
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

          comment @prependNode(connections: $connections, edgeTypeName: "FeedEventCommentEdge") {
            dbid
            ...CommentLineFragment
          }
        }
      }
    }
  `);

  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLParagraphElement | null>(null);

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

    try {
      const interactionsConnection = ConnectionHandler.getConnectionID(
        event.id,
        'Interactions_comments'
      );
      const notesModalConnection = ConnectionHandler.getConnectionID(
        event.id,
        'NotesModal_interactions'
      );

      const optimisticId = Math.random().toString();
      console.log('ooptimsitci id', optimisticId);
      const response = await submitComment({
        updater: (store, response) => {
          if (response.commentOnFeedEvent?.__typename === 'CommentOnFeedEventPayload') {
            const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

            pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
          }
        },
        optimisticResponse: {
          commentOnFeedEvent: {
            __typename: 'CommentOnFeedEventPayload',
            comment: {
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

      // Tell the virtualized list that some data has changed
      // therefore this cell's height might change.
      //
      // Ideally, this lives in a useEffect inside of the
      // changing data's component, but right now the virtualized
      // list is remounting the component every update, causing
      // an infinite useEffect to occur
      setTimeout(() => {
        onPotentialLayoutShift();
      }, 100);

      if (response.commentOnFeedEvent?.__typename === 'CommentOnFeedEventPayload') {
        resetInputState();

        onClose();
      } else {
        // error handle
      }
    } catch (e) {
      // error handle
    }
  }, [
    event.dbid,
    event.id,
    isSubmittingComment,
    onClose,
    onPotentialLayoutShift,
    resetInputState,
    submitComment,
    value,
  ]);

  const handleClick = useCallback<MouseEventHandler<HTMLElement>>((event) => {
    event.stopPropagation();
  }, []);

  return (
    <>
      {active && <ClickPreventingOverlay onClick={onClose} />}
      <CommentBoxWrapper active={active}>
        <Wrapper onClick={handleClick}>
          <InputWrapper gap={12}>
            {/* Purposely not using a controlled input here to avoid cursor jitter */}
            <Textarea
              ref={textareaRef}
              onInput={(event) => {
                const nextValue = event.currentTarget.textContent ?? '';

                if (nextValue.length > MAX_TEXT_LENGTH) {
                  event.currentTarget.textContent = nextValue.slice(0, 100);

                  // Set the cursor to the end of the editable content
                  const range = document.createRange();
                  const selection = window.getSelection();

                  if (!selection) {
                    return;
                  }

                  range.setStart(event.currentTarget.childNodes[0], MAX_TEXT_LENGTH);
                  range.setEnd(event.currentTarget.childNodes[0], MAX_TEXT_LENGTH);
                  range.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(range);
                  // End range garbage
                } else {
                  setValue(nextValue);
                }
              }}
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

  padding: 6px 0;

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
