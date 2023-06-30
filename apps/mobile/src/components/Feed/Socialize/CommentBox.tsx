import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import Animated, {
  AnimatedStyleProp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ConnectionHandler, fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';
import { XMarkIcon } from 'src/icons/XMarkIcon';
import useKeyboardStatus from 'src/utils/useKeyboardStatus';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { CommentBoxMutation } from '~/generated/CommentBoxMutation.graphql';
import { CommentBoxQuery } from '~/generated/CommentBoxQuery.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import colors from '~/shared/theme/colors';

import { SendIcon } from './SendIcon';

type Props = {
  feedEventId: string;

  onClose: () => void;
  autoFocus?: boolean;

  // If its coming from comment button, show the x mark
  isNotesModal?: boolean;
};

export function CommentBox({ autoFocus, onClose, isNotesModal = false, feedEventId }: Props) {
  const reportError = useReportError();
  const { colorScheme } = useColorScheme();
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

  const relayEnvironment = useRelayEnvironment();
  const handleSubmit = useCallback(async () => {
    if (value.length === 0) {
      return;
    }

    try {
      const eventRelayId = `FeedEvent:${feedEventId}`;
      const query = await fetchQuery<CommentBoxQuery>(
        relayEnvironment,
        graphql`
          query CommentBoxQuery {
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
        {},
        { fetchPolicy: 'store-or-network' }
      ).toPromise();

      const interactionsConnection = ConnectionHandler.getConnectionID(
        eventRelayId,
        'Interactions_comments'
      );
      const commentsBottomSheetConnection = ConnectionHandler.getConnectionID(
        eventRelayId,
        'CommentsBottomSheet_comments'
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
                dbid: query?.viewer?.user?.dbid ?? 'unknown',
                id: query?.viewer?.user?.id ?? 'unknown',
                username: query?.viewer?.user?.username ?? null,
              },
              creationTime: new Date().toISOString(),
              dbid: optimisticId,
              id: `Comment:${optimisticId}`,
            },
          },
        },
        variables: {
          comment: value,
          eventId: feedEventId,
          connections: [interactionsConnection, commentsBottomSheetConnection],
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
  }, [value, feedEventId, relayEnvironment, submitComment, resetComment, reportError]);

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
      <Animated.View className="flex-1 flex-row justify-between items-center bg-faint dark:bg-black-800 p-1.5 space-x-3">
        <BottomSheetTextInput
          value={value}
          onChangeText={setValue}
          className="text-sm h-5"
          selectionColor={colorScheme === 'dark' ? colors.white : colors.black['800']}
          autoCapitalize="none"
          autoComplete="off"
          autoFocus={autoFocus}
          onBlur={handleDismiss}
          onSubmitEditing={handleDismiss}
          style={{ flex: 1, color: colorScheme === 'dark' ? colors.white : colors.black['800'] }}
        />
        <Text className="text-sm text-metal">{characterCount}</Text>
        <GalleryTouchableOpacity
          eventElementId="Submit Comment Button"
          eventName="Submit Comment Button Clicked"
          onPress={handleSubmit}
          disabled={disabledSendButton}
        >
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
        <GalleryTouchableOpacity eventElementId={null} eventName={null} onPress={handleDismiss}>
          <View className="h-6 w-6  items-center justify-center rounded-full">
            <XMarkIcon />
          </View>
        </GalleryTouchableOpacity>
      </Animated.View>
    </View>
  );
}
