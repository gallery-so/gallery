import { TouchableOpacity, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { FeedEventSocializeSectionFragment$key } from '~/generated/FeedEventSocializeSectionFragment.graphql';
import { FeedEventSocializeSectionQueryFragment$key } from '~/generated/FeedEventSocializeSectionQueryFragment.graphql';

import { AdmireButton } from './AdmireButton';
import { CommentIcon } from './CommentIcon';
import { Interactions } from './Interactions';

type Props = {
  feedEventRef: FeedEventSocializeSectionFragment$key;
  queryRef: FeedEventSocializeSectionQueryFragment$key;
};

export function FeedEventSocializeSection({ feedEventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment FeedEventSocializeSectionFragment on FeedEvent {
        ...InteractionsFragment
        ...AdmireButtonFragment
      }
    `,
    feedEventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventSocializeSectionQueryFragment on Query {
        ...InteractionsQueryFragment
        ...AdmireButtonQueryFragment
      }
    `,
    queryRef
  );

  return (
    <View className="flex flex-row items-center justify-between px-3 py-2">
      <Interactions eventRef={event} queryRef={query} />

      <View className="flex flex-row space-x-4">
        <AdmireButton eventRef={event} queryRef={query} />
        <TouchableOpacity onPress={() => {}}>
          <CommentIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
}
