import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useEventComment } from 'src/hooks/useEventComment';
import { useToggleAdmire } from 'src/hooks/useToggleAdmire';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { FeedEventSocializeSectionFragment$key } from '~/generated/FeedEventSocializeSectionFragment.graphql';
import { FeedEventSocializeSectionQueryFragment$key } from '~/generated/FeedEventSocializeSectionQueryFragment.graphql';

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
  const bottomSheetRef = useRef<GalleryBottomSheetModalType>(null);

  const { toggleAdmire, hasViewerAdmiredEvent } = useToggleAdmire({
    eventRef: event,
    queryRef: query,
  });

  const { submitComment, isSubmittingComment } = useEventComment();

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

  const handleSubmit = useCallback(
    (value: string) => {
      submitComment({
        feedEventId: event.dbid,
        value,
        onSuccess: () => {},
      });
    },
    [event.dbid, submitComment]
  );

  if (event.eventData?.__typename === 'UserFollowedUsersFeedEventData') {
    return <View className="pb-6" />;
  }

  return (
    <View className="flex flex-row px-3 justify-between pb-8 pt-5">
      <View className="flex-1 pr-4 pt-1">
        <Interactions
          type="FeedEvent"
          feedId={event.dbid}
          commentRefs={nonNullComments}
          admireRefs={nonNullAdmires}
          totalComments={totalComments}
          totalAdmires={totalAdmires}
          onAdmirePress={toggleAdmire}
        />
      </View>

      <View className="flex flex-row space-x-1">
        <AdmireButton onPress={toggleAdmire} isAdmired={hasViewerAdmiredEvent} />
        <CommentButton
          onClick={onCommentPress}
          onSubmit={handleSubmit}
          isSubmittingComment={isSubmittingComment}
          bottomSheetRef={bottomSheetRef}
        />
      </View>
    </View>
  );
}
