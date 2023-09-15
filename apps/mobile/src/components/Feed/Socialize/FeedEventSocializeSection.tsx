import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useToggleAdmire } from 'src/hooks/useToggleAdmire';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { FeedEventSocializeSectionFragment$key } from '~/generated/FeedEventSocializeSectionFragment.graphql';
import { FeedEventSocializeSectionQueryFragment$key } from '~/generated/FeedEventSocializeSectionQueryFragment.graphql';

import { CommentsBottomSheet } from '../CommentsBottomSheet/CommentsBottomSheet';
import { AdmireButton } from './AdmireButton';
import { CommentButton } from './CommentButton';
import { Interactions } from './Interactions';

type Props = {
  feedEventRef: FeedEventSocializeSectionFragment$key;
  queryRef: FeedEventSocializeSectionQueryFragment$key;
  onCommentPress: () => void;
};

export function FeedEventSocializeSection({ feedEventRef, queryRef, onCommentPress }: Props) {
  const event = useFragment(
    graphql`
      fragment FeedEventSocializeSectionFragment on FeedEvent {
        dbid
        eventData {
          ... on GalleryUpdatedFeedEventData {
            __typename
          }
          ... on UserFollowedUsersFeedEventData {
            __typename
          }
        }

        # We only show 1 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
        admires(last: 5) @connection(key: "Interactions_admires") {
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
        comments(last: 5) @connection(key: "Interactions_comments") {
          pageInfo {
            total
          }
          edges {
            node {
              ...InteractionsCommentsFragment
            }
          }
        }

        ...useToggleAdmireFragment
      }
    `,
    feedEventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventSocializeSectionQueryFragment on Query {
        ...useToggleAdmireQueryFragment
      }
    `,
    queryRef
  );

  const { toggleAdmire, hasViewerAdmiredEvent } = useToggleAdmire({
    eventRef: event,
    queryRef: query,
  });

  const nonNullComments = useMemo(() => {
    const comments = [];

    for (const edge of event.comments?.edges ?? []) {
      if (edge?.node) {
        comments.push(edge.node);
      }
    }

    return comments;
  }, [event.comments?.edges]);

  const totalComments = event.comments?.pageInfo?.total ?? 0;
  const isEmptyComments = totalComments === 0;

  const nonNullAdmires = useMemo(() => {
    const admires = [];

    for (const edge of event.admires?.edges ?? []) {
      if (edge?.node) {
        admires.push(edge.node);
      }
    }

    admires.reverse();

    return admires;
  }, [event.admires?.edges]);

  const totalAdmires = event.admires?.pageInfo?.total ?? 0;

  const commentsBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleOpenCommentBottomSheet = useCallback(() => {
    commentsBottomSheetRef.current?.present();
    onCommentPress();
  }, [onCommentPress]);

  if (event.eventData?.__typename === 'UserFollowedUsersFeedEventData') {
    return <View className="pb-6" />;
  }

  const eventDataType =
    event.eventData?.__typename === 'GalleryUpdatedFeedEventData' ? 'FeedEvent' : 'Post';

  return (
    <>
      <View className="px-3 pb-8 pt-5">
        <View className="flex flex-row justify-between">
          <View className="flex-1 pr-4 pt-1">
            <Interactions
              type="FeedEvent"
              feedId={event.dbid}
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
            eventElementId={null}
            eventName={null}
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
      <CommentsBottomSheet
        type={eventDataType}
        feedId={event.dbid}
        bottomSheetRef={commentsBottomSheetRef}
      />
    </>
  );
}
