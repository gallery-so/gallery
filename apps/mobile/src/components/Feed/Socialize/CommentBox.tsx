import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ConnectionHandler, graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';
import { XMarkIcon } from 'src/icons/XMarkIcon';
import useKeyboardStatus from 'src/utils/useKeyboardStatus';

import { CommentBoxFragment$key } from '~/generated/CommentBoxFragment.graphql';
import { CommentBoxMutation } from '~/generated/CommentBoxMutation.graphql';
import { CommentBoxQueryFragment$key } from '~/generated/CommentBoxQueryFragment.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import colors from '~/shared/theme/colors';

import { SendIcon } from './SendIcon';

type Props = {
  eventRef: CommentBoxFragment$key;
  queryRef: CommentBoxQueryFragment$key;
  onClose: () => void;
  autoFocus?: boolean;

  // If its coming from comment button, show the x mark
  isNotesModal?: boolean;
};

export function CommentBox({
  autoFocus,
  eventRef,
  queryRef,
  onClose,
  isNotesModal = false,
}: Props) {
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

  const [value, setValue] = useState('');

  const characterCount = useMemo(() => 100 - value.length, [value]);

  const isKeyboardActive = useKeyboardStatus();

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const resetComment = useCallback(() => {
    setValue('');
  }, []);

  const showXMark = useMemo(() => {
    // If its coming from comment button, show the x mark
    if (!isNotesModal) return true;

    // If not, check the KeyboardActive
    return isKeyboardActive;
  }, [isKeyboardActive, isNotesModal]);

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
    if (value.length === 0) {
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
          comment: value,
          eventId: event.dbid,
          connections: [interactionsConnection, notesModalConnection],
        },
      });

      if (response.commentOnFeedEvent?.__typename === 'CommentOnFeedEventPayload') {
        resetComment();
      } else {
        // TODO: handle or track error whenever we setup tracker
      }
    } catch {
      // TODO: handle or track error whenever we setup tracker
    }
  }, [
    value,
    event.dbid,
    event.id,
    query.viewer?.user?.dbid,
    query.viewer?.user?.id,
    query.viewer?.user?.username,
    submitComment,
    resetComment,
  ]);

  const disabledSendButton = useMemo(() => {
    return value.length === 0 || characterCount < 0 || isSubmittingComment;
  }, [value.length, characterCount, isSubmittingComment]);

  const width = useSharedValue(0);
  const xmarkIconStyle = useAnimatedStyle(() => {
    return {
      overflow: 'hidden',
      width: width.value,
    };
  });

  useLayoutEffect(() => {
    if (showXMark) {
      width.value = withSpring(20, { overshootClamping: true });
    } else {
      width.value = withSpring(0, { overshootClamping: true });
    }
  }, [showXMark, width]);

  return (
    <View className="px-2 pb-2 flex flex-row items-center space-x-3">
      <Animated.View className="flex-1 flex-row justify-between items-center bg-faint p-2 space-x-3">
        <BottomSheetTextInput
          value={value}
          onChangeText={setValue}
          className="text-offBlack text-sm"
          style={{ flex: 1 }}
          selectionColor={colors.offBlack}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          autoFocus={autoFocus}
          onSubmitEditing={handleDismiss}
        />
        <Text className="text-sm text-metal">{characterCount}</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={disabledSendButton}
          className={`h-6 w-6 rounded-full flex items-center justify-center
            ${disabledSendButton ? 'bg-metal' : 'bg-activeBlue'}
        `}
        >
          <SendIcon />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={xmarkIconStyle}>
        <TouchableOpacity onPress={handleDismiss}>
          <XMarkIcon />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
