import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useAdmireComment } from 'src/hooks/useAdmireComment';
import { useDeleteComment } from 'src/hooks/useDeleteComment';
import { InfoCircleIcon } from 'src/icons/InfoCircleIcon';
import { TrashIcon } from 'src/icons/TrashIcon';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { CommentsBottomSheetLineFragment$key } from '~/generated/CommentsBottomSheetLineFragment.graphql';
import { CommentsBottomSheetLineQueryFragment$key } from '~/generated/CommentsBottomSheetLineQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';

import { AdmireIcon } from '../Socialize/AdmireIcon';
import { DeleteCommentWarningBottomSheet } from './DeleteCommentWarningBottomSheet';

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
};

export function CommentsBottomSheetLine({
  activeCommentId,
  commentRef,
  onReplyPress,
  footerElement,
  isReply,
  queryRef,
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

  const { toggleAdmire, totalAdmires, hasViewerAdmiredComment } = useAdmireComment({
    commentRef: comment,
    queryRef: query,
  });

  const { deleteComment } = useDeleteComment({
    commentRef: comment,
  });

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const timeAgo = getTimeSince(comment.creationTime);
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const isAuthUserComment = useMemo(() => {
    return comment?.commenter?.dbid === query?.viewer?.user?.dbid;
  }, [comment?.commenter?.dbid, query?.viewer?.user?.dbid]);

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

  const handleRemoveCommentPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleDelete = useCallback(() => {
    deleteComment();
  }, [deleteComment]);

  if (!comment.comment) {
    return null;
  }

  return (
    <View
      className={clsx('flex flex-row space-x-2 px-4 py-2', {
        'bg-offWhite dark:bg-black-800': activeCommentId === comment.dbid,
        'pl-12': isReply,
      })}
    >
      {comment.deleted ? (
        <DeletedComment isReply={isReply} />
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
                <View className="flex-row space-x-1">
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
                <ProcessedText text={comment.comment} mentionsRef={nonNullMentions} />
              </View>
              {isAuthUserComment && (
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
                    <AdmireIcon variant="secondary" height={16} active={hasViewerAdmiredComment} />
                  </GalleryTouchableOpacity>

                  <GalleryTouchableOpacity
                    className="flex-row justify-end items-center gap-0.5"
                    onPress={handleRemoveCommentPress}
                    eventElementId="Delete Comment Button"
                    eventName="Press Delete Comment Button"
                    eventContext={contexts.Posts}
                  >
                    <TrashIcon color={colors.metal} height={16} />
                  </GalleryTouchableOpacity>
                </View>
              )}
            </View>
            <View className="flex mr-5 space-y-1 pl-2">
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

          <DeleteCommentWarningBottomSheet ref={bottomSheetRef} onRemoveComment={handleDelete} />
        </>
      )}
    </View>
  );
}

function DeletedComment({ isReply }: { isReply?: boolean }) {
  const { colorScheme } = useColorScheme();

  return (
    <View className="bg-offWhite dark:bg-black-800 flex-1 px-3 py-[10]">
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
    </View>
  );
}
