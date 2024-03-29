import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { trigger } from 'react-native-haptic-feedback';
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useAdmireComment } from 'src/hooks/useAdmireComment';
import { useDeleteComment } from 'src/hooks/useDeleteComment';
import { InfoCircleIcon } from 'src/icons/InfoCircleIcon';
import { TrashIcon } from 'src/icons/TrashIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { CommentsBottomSheetLineFragment$key } from '~/generated/CommentsBottomSheetLineFragment.graphql';
import { CommentsBottomSheetLineQueryFragment$key } from '~/generated/CommentsBottomSheetLineQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';

import { AdmireIcon } from '../Socialize/AdmireIcon';

export type OnReplyPressParams = {
  username?: string;
  commentId?: string;
  comment?: string;
  topCommentId?: string;
} | null;

type CommentLineProps = {
  activeCommentId?: string;
  commentRef: CommentsBottomSheetLineFragment$key;
  onReplyPress: (params: OnReplyPressParams) => void;
  footerElement?: React.ReactNode;
  isReply?: boolean;
  queryRef: CommentsBottomSheetLineQueryFragment$key;
  hasReplies?: boolean;
};

export function CommentsBottomSheetLine({
  activeCommentId,
  commentRef,
  onReplyPress,
  footerElement,
  isReply,
  queryRef,
  hasReplies,
}: CommentLineProps) {
  const query = useFragment(
    graphql`
      fragment CommentsBottomSheetLineQueryFragment on Query {
        ...useAdmireCommentQueryFragment
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const comment = useFragment(
    graphql`
      fragment CommentsBottomSheetLineFragment on Comment {
        __typename
        dbid
        comment
        creationTime
        deleted
        commenter {
          username
          dbid
          ...ProfilePictureFragment
        }
        mentions {
          ...ProcessedTextFragment
        }
        ...useAdmireCommentFragment
        ...useDeleteCommentFragment
      }
    `,
    commentRef
  );

  const [justDeleted, setJustDeleted] = useState(false);

  const { toggleAdmire, totalAdmires, hasViewerAdmiredComment } = useAdmireComment({
    commentRef: comment,
    queryRef: query,
  });

  const { deleteComment } = useDeleteComment({
    commentRef: comment,
  });

  const track = useTrack();
  const isAuthUserComment = useMemo(() => {
    return comment?.commenter?.dbid === query?.viewer?.user?.dbid;
  }, [comment?.commenter?.dbid, query?.viewer?.user?.dbid]);

  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const TRANSLATE_X_THRESHOLD = SCREEN_WIDTH * 0.5;

  const translateX = useSharedValue(0);
  const hasTriggered = useRef(false);
  const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      if (!isAuthUserComment || comment.deleted) return;

      if (!hasTriggered.current && Math.abs(event.translationX) > TRANSLATE_X_THRESHOLD) {
        runOnJS(trigger)('impactLight');
        hasTriggered.current = true;
      }

      if (event.translationX > 0) {
        translateX.value = 0;
      } else {
        translateX.value = event.translationX;
      }
    },
    onEnd: (event) => {
      const shouldBeDismissed =
        Math.abs(event.translationX) > TRANSLATE_X_THRESHOLD && Math.abs(translateX.value) > 0;

      if (shouldBeDismissed) {
        translateX.value = withTiming(-SCREEN_WIDTH);
        runOnJS(deleteComment)();
        runOnJS(track)('Delete Comment Swipe', {
          id: 'Delete Comment Swipe',
          name: 'Delete Comment Swipe',
          context: contexts.Posts,
          flow: 'Delete Comment Swipe',
          screen: 'Comments Bottom Sheet',
        });
        runOnJS(setJustDeleted)(true);
      } else {
        translateX.value = withTiming(0);
      }

      hasTriggered.current = false;
      translateX.value = withTiming(0);
    },
  });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const timeAgo = getTimeSince(comment.creationTime);
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleUserPress = useCallback(() => {
    const username = comment?.commenter?.username;
    if (username) {
      navigation.push('Profile', { username: username, hideBackButton: false });
    }
  }, [comment?.commenter?.username, navigation]);

  const nonNullMentions = useMemo(() => removeNullValues(comment.mentions), [comment.mentions]);

  const handleReplyPress = useCallback(() => {
    onReplyPress({
      username: comment?.commenter?.username ?? '',
      comment: comment.comment ?? '',
      commentId: comment.dbid,
    });
  }, [comment?.commenter?.username, comment.dbid, comment.comment, onReplyPress]);

  const handleAdmirePress = useCallback(() => {
    toggleAdmire();
  }, [toggleAdmire]);

  if (!comment.comment) {
    return null;
  }

  if (comment.deleted && !hasReplies) {
    return null;
  }

  return (
    <View className="relative">
      <PanGestureHandler onGestureEvent={panGesture} activeOffsetX={[-10, 10]}>
        <Animated.View
          className={clsx('flex flex-row space-x-2 bg-white dark:bg-black-900 px-4 py-2 z-10', {
            'bg-offWhite dark:bg-black-800': activeCommentId === comment.dbid,
            'pl-12': isReply,
          })}
          style={[rStyle]}
        >
          {comment.deleted ? (
            <DeletedComment isReply={isReply} justDeleted={justDeleted} />
          ) : (
            <>
              {comment.commenter && (
                <View className="mt-1">
                  <GalleryTouchableOpacity
                    onPress={handleUserPress}
                    eventElementId={'PFP in comment'}
                    eventName={'PFP in comment Press'}
                    eventContext={contexts.Posts}
                  >
                    <ProfilePicture userRef={comment.commenter} size="sm" />
                  </GalleryTouchableOpacity>
                </View>
              )}
              <View className="flex-1">
                <View className="flex-row space-x-3 w-full justify-between">
                  <View className="flex-1">
                    <View className="flex-row justify-between">
                      <View className="flex-row space-x-1 items-start">
                        <Typography
                          className="text-sm leading-4"
                          font={{ family: 'ABCDiatype', weight: 'Bold' }}
                        >
                          {comment.commenter?.username}
                        </Typography>
                        <Typography
                          className="text-xxs text-metal leading-4"
                          font={{ family: 'ABCDiatype', weight: 'Regular' }}
                        >
                          {timeAgo}
                        </Typography>
                      </View>
                      <View className="flex-row items-center space-x-1">
                        <GalleryTouchableOpacity
                          className="flex-row justify-end items-center gap-0.5"
                          onPress={handleAdmirePress}
                          eventElementId="Admire Comment Button"
                          eventName="Press Admire Comment Button"
                          eventContext={contexts.Posts}
                        >
                          {totalAdmires > 0 && (
                            <Typography
                              className={clsx('text-xs', {
                                'text-activeBlue dark:text-darkModeBlue': hasViewerAdmiredComment,
                                'text-shadow dark:text-metal': !hasViewerAdmiredComment,
                              })}
                              font={{ family: 'ABCDiatype', weight: 'Bold' }}
                            >
                              {totalAdmires}
                            </Typography>
                          )}
                          <AdmireIcon
                            variant="secondary"
                            height={16}
                            active={hasViewerAdmiredComment}
                          />
                        </GalleryTouchableOpacity>
                      </View>
                    </View>
                    <ProcessedText text={comment.comment} mentionsRef={nonNullMentions} />
                  </View>
                </View>
                <View className="flex mr-5 space-y-1">
                  <GalleryTouchableOpacity
                    eventElementId={'Reply to Comment'}
                    eventName={'Reply to Comment Press'}
                    eventContext={contexts.Posts}
                    onPress={handleReplyPress}
                  >
                    <Typography
                      className="text-xs text-shadow"
                      font={{ family: 'ABCDiatype', weight: 'Bold' }}
                    >
                      Reply
                    </Typography>
                  </GalleryTouchableOpacity>

                  {footerElement}
                </View>
              </View>
            </>
          )}
        </Animated.View>
      </PanGestureHandler>
      <View className="absolute p-4 flex-row items-center justify-end w-full h-full bg-red">
        <Typography className="text-sm text-white" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Delete comment
        </Typography>
        <TrashIcon color={colors.white} height={16} />
      </View>
    </View>
  );
}

function DeletedComment({ justDeleted, isReply }: { justDeleted: boolean; isReply?: boolean }) {
  const { colorScheme } = useColorScheme();
  const transition = FadeIn.duration(300).easing(Easing.inOut(Easing.ease));

  return (
    <Animated.View
      entering={justDeleted ? transition : undefined}
      exiting={justDeleted ? transition : undefined}
      className="bg-offWhite dark:bg-black-800 flex-1 px-3 py-[10]"
    >
      <View className="flex-row items-center space-x-1">
        <InfoCircleIcon
          color={colorScheme === 'dark' ? colors.offWhite : colors.shadow}
          height={16}
        />
        <Typography
          className="text-sm text-shadow dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          This {''}
          {isReply ? 'reply' : 'comment'} {''}
          has been deleted
        </Typography>
      </View>
    </Animated.View>
  );
}
