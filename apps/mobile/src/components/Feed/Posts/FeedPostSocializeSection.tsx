import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useTogglePostAdmire } from 'src/hooks/useTogglePostAdmire';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { FeedPostSocializeSectionFragment$key } from '~/generated/FeedPostSocializeSectionFragment.graphql';
import { FeedPostSocializeSectionQueryFragment$key } from '~/generated/FeedPostSocializeSectionQueryFragment.graphql';
import { MainTabStackNavigatorParamList, MainTabStackNavigatorProp } from '~/navigation/types';

import { CommentsBottomSheet } from '../CommentsBottomSheet/CommentsBottomSheet';
import { AdmireButton } from '../Socialize/AdmireButton';
import { Admires } from '../Socialize/Admires';
import { CommentButton } from '../Socialize/CommentButton';
import Comments from '../Socialize/Comments';

type Props = {
  feedPostRef: FeedPostSocializeSectionFragment$key;
  queryRef: FeedPostSocializeSectionQueryFragment$key;
  onCommentPress: () => void;
};

export function FeedPostSocializeSection({ feedPostRef, queryRef }: Props) {
  const post = useFragment(
    graphql`
      fragment FeedPostSocializeSectionFragment on Post {
        dbid
        totalComments

        # We only show 1 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
        admires(last: 5) @connection(key: "Interactions_post_admires") {
          pageInfo {
            total
          }
          edges {
            node {
              dbid
              ...AdmiresFragment
            }
          }
        }

        # We only show 2 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
        comments(last: 5) @connection(key: "Interactions_post_comments") {
          pageInfo {
            total
          }
          edges {
            node {
              ...CommentsFragment
            }
          }
        }

        ...useTogglePostAdmireFragment
      }
    `,
    feedPostRef
  );

  const query = useFragment(
    graphql`
      fragment FeedPostSocializeSectionQueryFragment on Query {
        ...useTogglePostAdmireQueryFragment
      }
    `,
    queryRef
  );

  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Post'>>();

  const { toggleAdmire, hasViewerAdmiredEvent } = useTogglePostAdmire({
    postRef: post,
    queryRef: query,
  });

  const nonNullComments = useMemo(() => {
    const comments = [];

    for (const edge of post.comments?.edges ?? []) {
      if (edge?.node) {
        comments.push(edge.node);
      }
    }

    return comments;
  }, [post.comments?.edges]);

  const totalComments = post.totalComments ?? 0;

  const nonNullAdmires = useMemo(() => {
    const admires = [];

    for (const edge of post.admires?.edges ?? []) {
      if (edge?.node) {
        admires.push(edge.node);
      }
    }

    admires.reverse();

    return admires;
  }, [post.admires?.edges]);

  const totalAdmires = post.admires?.pageInfo?.total ?? 0;
  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const { showBottomSheetModal } = useBottomSheetModalActions();
  const handleOpenCommentBottomSheet = useCallback(() => {
    showBottomSheetModal({
      content: (
        <CommentsBottomSheet
          type="Post"
          feedId={post.dbid}
          activeCommentId={route.params?.commentId}
          replyToComment={route.params?.replyToComment}
        />
      ),
      noPadding: true,
      navigationContext: navigation,
    });
  }, [
    navigation,
    post.dbid,
    route.params?.commentId,
    route.params?.replyToComment,
    showBottomSheetModal,
  ]);

  useEffect(() => {
    if (route.params?.commentId) {
      handleOpenCommentBottomSheet();
    }
  }, [route.params, handleOpenCommentBottomSheet]);

  return (
    <>
      <View className="px-3 pt-2">
        <View className="flex flex-row justify-between">
          <View className="flex-1 pr-4 pt-1">
            <Admires
              type="Post"
              feedId={post.dbid}
              admireRefs={nonNullAdmires}
              totalAdmires={totalAdmires}
              onAdmirePress={toggleAdmire}
              openCommentBottomSheet={handleOpenCommentBottomSheet}
            />
          </View>

          <View className="flex flex-row space-x-1">
            <AdmireButton onPress={toggleAdmire} isAdmired={hasViewerAdmiredEvent} />
            <CommentButton openCommentBottomSheet={handleOpenCommentBottomSheet} />
          </View>
        </View>
        <Comments
          commentRefs={nonNullComments}
          totalComments={totalComments}
          onCommentPress={handleOpenCommentBottomSheet}
        />
      </View>
    </>
  );
}
