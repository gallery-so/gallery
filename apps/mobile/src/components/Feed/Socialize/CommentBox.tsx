import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Text, useColorScheme, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { AnimatedStyleProp } from 'react-native-reanimated';
import { ConnectionHandler, graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';
import { XMarkIcon } from 'src/icons/XMarkIcon';
import useKeyboardStatus from 'src/utils/useKeyboardStatus';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { CommentBoxFragment$key } from '~/generated/CommentBoxFragment.graphql';
import { CommentBoxMutation } from '~/generated/CommentBoxMutation.graphql';
import { CommentBoxQueryFragment$key } from '~/generated/CommentBoxQueryFragment.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
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

  const reportError = useReportError();
  const colorScheme = useColorScheme();
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
        'NotesList_interactions'
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
        reportError(
          `Error while commenting on feed event, typename was ${response.commentOnFeedEvent?.__typename}`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError('An unexpected error occurred while posting a comment.');
      }
    }
  }, [
    value,
    event.dbid,
    event.id,
    query.viewer?.user?.dbid,
    query.viewer?.user?.id,
    query.viewer?.user?.username,
    submitComment,
    reportError,
    resetComment,
  ]);

  const disabledSendButton = useMemo(() => {
    return value.length === 0 || characterCount < 0 || isSubmittingComment;
  }, [value.length, characterCount, isSubmittingComment]);

  const width = useSharedValue(0);
  const display = useSharedValue('none');
  const xmarkIconStyle = useAnimatedStyle(() => {
    return {
      overflow: 'hidden',
      width: width.value,
      display: display.value,
    } as AnimatedStyleProp<ViewStyle>;
  });

  useLayoutEffect(() => {
    if (showXMark) {
      width.value = withSpring(20, { overshootClamping: true });
      display.value = 'flex';
    } else {
      width.value = withSpring(0, { overshootClamping: true });
      display.value = 'none';
    }
  }, [showXMark, width, display]);

  return (
    <View className="px-2 pb-2 flex flex-row items-center space-x-3">
      <Animated.View className="flex-1 flex-row justify-between items-center bg-faint dark:bg-offBlack p-1.5 space-x-3">
        <BottomSheetTextInput
          value={value}
          onChangeText={setValue}
          className="text-sm h-5"
          selectionColor={colorScheme === 'dark' ? colors.white : colors.offBlack}
          autoCapitalize="none"
          autoComplete="off"
          autoFocus={autoFocus}
          onBlur={handleDismiss}
          onSubmitEditing={handleDismiss}
          style={{ flex: 1, color: colorScheme === 'dark' ? colors.white : colors.offBlack }}
        />
        <Text className="text-sm text-metal">{characterCount}</Text>
        <GalleryTouchableOpacity onPress={handleSubmit} disabled={disabledSendButton}>
          <View
            className={`h-6 w-6 rounded-full flex items-center justify-center bg-red
            ${disabledSendButton ? 'bg-metal' : 'bg-activeBlue'}
        `}
          >
            <SendIcon />
          </View>
        </GalleryTouchableOpacity>
      </Animated.View>

      <Animated.View style={xmarkIconStyle}>
        <GalleryTouchableOpacity onPress={handleDismiss}>
          <View className="h-6 w-6  items-center justify-center rounded-full">
            <XMarkIcon />
          </View>
        </GalleryTouchableOpacity>
      </Animated.View>
    </View>
  );
}
