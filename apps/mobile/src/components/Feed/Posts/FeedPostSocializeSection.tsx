import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useTogglePostAdmire } from 'src/hooks/useTogglePostAdmire';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { FeedPostSocializeSectionFragment$key } from '~/generated/FeedPostSocializeSectionFragment.graphql';
import { FeedPostSocializeSectionQueryFragment$key } from '~/generated/FeedPostSocializeSectionQueryFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

import { CommentsBottomSheet } from '../CommentsBottomSheet/CommentsBottomSheet';
import { AdmireButton } from '../Socialize/AdmireButton';
import { CommentButton } from '../Socialize/CommentButton';
import { Interactions } from '../Socialize/Interactions';

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

        # We only show 1 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
        admires(last: 5) @connection(key: "Interactions_post_admires") {
          pageInfo {
            total
          }
          edges {
            node {
              dbid
              ...InteractionsAdmiresFragment
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
              ...InteractionsCommentsFragment
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

  const totalComments = post.comments?.pageInfo?.total ?? 0;
  const isEmptyComments = totalComments === 0;

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

  const commentsBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleOpenCommentBottomSheet = useCallback(() => {
    commentsBottomSheetRef.current?.present();
  }, []);

  return (
    <>
      <View className="px-3 pb-8 pt-2">
        <View className="flex flex-row justify-between">
          <View className="flex-1 pr-4 pt-1">
            <Interactions
              type="Post"
              feedId={post.dbid}
              commentRefs={nonNullComments}
              admireRefs={nonNullAdmires}
              totalComments={totalComments}
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
        {isEmptyComments && (
          <GalleryTouchableOpacity
            onPress={handleOpenCommentBottomSheet}
            eventElementId="Add Comment Button"
            eventName="Add Comment"
            eventContext={contexts.Posts}
          >
            <Typography
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
              className="text-sm text-shadow"
            >
              Add a comment
            </Typography>
          </GalleryTouchableOpacity>
        )}
      </View>
      <CommentsBottomSheet type="Post" feedId={post.dbid} bottomSheetRef={commentsBottomSheetRef} />
    </>
  );
}
