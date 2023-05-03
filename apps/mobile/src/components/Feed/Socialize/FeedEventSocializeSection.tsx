import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

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
        ...InteractionsFragment
        ...AdmireButtonFragment
        ...CommentButtonFragment
      }
    `,
    feedEventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventSocializeSectionQueryFragment on Query {
        ...InteractionsQueryFragment
        ...AdmireButtonQueryFragment
        ...CommentButtonQueryFragment
      }
    `,
    queryRef
  );

  return (
    <View className="flex flex-row items-center justify-between px-3 pb-8 pt-5">
      <Interactions eventRef={event} queryRef={query} />

      <View className="flex flex-row space-x-4">
        <AdmireButton eventRef={event} queryRef={query} />
        <CommentButton eventRef={event} queryRef={query} onClick={onCommentPress} />
      </View>
    </View>
  );
}
