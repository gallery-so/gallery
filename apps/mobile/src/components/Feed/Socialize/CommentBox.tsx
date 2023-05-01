import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ConnectionHandler, graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';
import { XMarkIcon } from 'src/icons/XMarkIcon';

import { CommentBoxFragment$key } from '~/generated/CommentBoxFragment.graphql';
import { CommentBoxMutation } from '~/generated/CommentBoxMutation.graphql';
import { CommentBoxQueryFragment$key } from '~/generated/CommentBoxQueryFragment.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import colors from '~/shared/theme/colors';

import { SendIcon } from './SendIcon';

type Props = {
  eventRef: CommentBoxFragment$key;
  queryRef: CommentBoxQueryFragment$key;
};

export function CommentBox({ eventRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CommentBoxQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
              dbid
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

  const [comment, setComment] = useState('');

  const { dismiss } = useBottomSheetModal();

  const ref = useRef<TextInput>(null);

  const handleFocus = useCallback(() => {
    // Need to focus after a certain number of ms, otherwise the input immediately loses focus
    // https://github.com/facebook/react-native/issues/30162#issuecomment-1046090316
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
      }
    }, 500);
  }, [ref]);

  // Seems like can't use useFocusEffect in this context since it's not inside a navigator
  useEffect(() => {
    handleFocus();
  }, [handleFocus]);

  const characterCount = useMemo(() => 100 - comment.length, [comment]);

  const handleDismiss = useCallback(() => {
    dismiss();
  }, [dismiss]);

  const resetComment = useCallback(() => {
    setComment('');
  }, []);

  const [submitComment, isSubmittingComment] = usePromisifiedMutation<CommentBoxMutation>(graphql`
    mutation CommentBoxMutation($eventId: DBID!, $comment: String!, $connections: [ID!]!)
    @raw_response_type {
      commentOnFeedEvent(comment: $comment, feedEventId: $eventId) {
        ... on CommentOnFeedEventPayload {
          __typename

          comment @appendNode(connections: $connections, edgeTypeName: "FeedEventCommentEdge") {
            dbid
            __typename
            comment
            commenter {
              dbid
              id
              username
            }
            creationTime
          }
        }
      }
    }
  `);

  const handleSubmit = useCallback(async () => {
    if (comment.length === 0) {
      return;
    }

    try {
      const interactionsConnection = ConnectionHandler.getConnectionID(
        event.id,
        'Interactions_comments'
      );
      // const notesModalConnection = ConnectionHandler.getConnectionID(
      //   event.id,
      //   'NotesModal_interactions'
      // );

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
              comment: comment,
              commenter: {
                dbid: query.viewer?.user?.dbid ?? 'unknown',
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
          comment: comment,
          eventId: event.dbid,
          connections: [
            interactionsConnection,
            // notesModalConnection
          ],
        },
      });

      if (response.commentOnFeedEvent?.__typename === 'CommentOnFeedEventPayload') {
        resetComment();
        // onClose();
      } else {
        // TODO: handle error
        // pushErrorToast();
        // reportError(
        //   `Error while commenting on feed event, typename was ${response.commentOnFeedEvent?.__typename}`
        // );
      }
    } catch {
      // TODO: handle error
    }
  }, [
    comment,
    event.dbid,
    event.id,
    query.viewer?.user?.dbid,
    query.viewer?.user?.id,
    query.viewer?.user?.username,
    submitComment,
    resetComment,
  ]);

  return (
    <View className="p-4 flex flex-row items-center space-x-3">
      <View className="flex-1 flex-row justify-between items-center bg-faint p-2 space-x-3">
        <TextInput
          ref={ref}
          className="text-offBlack text-sm flex-1"
          selectionColor={colors.offBlack}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          value={comment}
          onChangeText={setComment}
        />
        <Text className="text-sm text-metal">{characterCount}</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={comment.length === 0 || isSubmittingComment}
          className={`h-6 w-6 rounded-full flex items-center justify-center
            ${comment.length === 0 ? 'bg-metal' : 'bg-activeBlue'}
        `}
        >
          <SendIcon />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleDismiss}>
        <XMarkIcon />
      </TouchableOpacity>
    </View>
  );
}
