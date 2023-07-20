import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useTogglePostAdmire } from 'src/hooks/useTogglePostAdmire';

import { FeedPostSocializeSectionFragment$key } from '~/generated/FeedPostSocializeSectionFragment.graphql';
import { FeedPostSocializeSectionQueryFragment$key } from '~/generated/FeedPostSocializeSectionQueryFragment.graphql';

import { AdmireButton } from '../Socialize/AdmireButton';

type Props = {
  feedPostRef: FeedPostSocializeSectionFragment$key;
  queryRef: FeedPostSocializeSectionQueryFragment$key;
};

export function FeedPostSocializeSection({ feedPostRef, queryRef }: Props) {
  const post = useFragment(
    graphql`
      fragment FeedPostSocializeSectionFragment on Post {
        # eventData {
        #  ... on UserFollowedUsersFeedEventData {
        #    __typename
        #  }
        #}

        # ...InteractionsFragment
        # ...CommentButtonFragment
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

  return (
    <View className="flex flex-row px-3 justify-between pb-8 pt-5">
      <View className="flex-1 pr-4 pt-1">{/* <Interactions eventRef={event} /> */}</View>

      <View className="flex flex-row space-x-1">
        <AdmireButton onPress={toggleAdmire} isAdmired={hasViewerAdmiredEvent} />
        {/* <CommentButton eventRef={event} onClick={onCommentPress} /> */}
      </View>
    </View>
  );
}
