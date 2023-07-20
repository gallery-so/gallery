import { useCallback } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useEventComment } from 'src/hooks/useEventComment';
import { useToggleAdmire } from 'src/hooks/useToggleAdmire';

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

        ...InteractionsFragment
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

  const { submitComment, isSubmittingComment } = useEventComment();

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
        <Interactions eventRef={event} />
      </View>

      <View className="flex flex-row space-x-1">
        <AdmireButton onPress={toggleAdmire} isAdmired={hasViewerAdmiredEvent} />
        <CommentButton
          onClick={onCommentPress}
          onSubmit={handleSubmit}
          isSubmittingComment={isSubmittingComment}
        />
      </View>
    </View>
  );
}
