import { Suspense, useState } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import isFeatureEnabled, { FeatureFlag } from 'src/utils/isFeatureEnabled';

import { FEED_PER_PAGE } from '~/components/Feed/constants';
import { ActiveFeed } from '~/components/Feed/FeedFilter';
import { FollowingFeed } from '~/components/Feed/FollowingFeed';
import { LatestScreenFeatureQuery } from '~/generated/LatestScreenFeatureQuery.graphql';
import { LatestScreenFragment$key } from '~/generated/LatestScreenFragment.graphql';
import { LatestScreenQuery } from '~/generated/LatestScreenQuery.graphql';

import { LoadingFeedList } from '../../components/Feed/LoadingFeedList';
import { WorldwideFeed } from '../../components/Feed/WorldwideFeed';

type LatestScreenInnerProps = {
  queryRef: LatestScreenFragment$key;
};

function LatestScreenInner({ queryRef }: LatestScreenInnerProps) {
  const query = useFragment(
    graphql`
      fragment LatestScreenFragment on Query {
        ...FollowingFeedFragment
        ...WorldwideFeedFragment
      }
    `,
    queryRef
  );

  const [activeFeed, setActiveFeed] = useState<ActiveFeed>('Worldwide');

  return activeFeed === 'Following' ? (
    <FollowingFeed queryRef={query} onChangeFeedMode={setActiveFeed} />
  ) : (
    <WorldwideFeed queryRef={query} onChangeFeedMode={setActiveFeed} />
  );
}

export function LatestScreen() {
  const featureQuery = useLazyLoadQuery<LatestScreenFeatureQuery>(
    graphql`
      query LatestScreenFeatureQuery {
        ...isFeatureEnabledFragment
      }
    `,
    {}
  );

  const isPostEnabled = isFeatureEnabled(FeatureFlag.KOALA, featureQuery);

  const query = useLazyLoadQuery<LatestScreenQuery>(
    graphql`
      query LatestScreenQuery(
        $globalFeedBefore: String
        $globalFeedCount: Int!
        $followingFeedBefore: String
        $followingFeedCount: Int!
        $includePosts: Boolean!
      ) {
        ...LatestScreenFragment
        ...isFeatureEnabledFragment
      }
    `,
    {
      globalFeedCount: FEED_PER_PAGE,
      followingFeedCount: FEED_PER_PAGE,
      includePosts: isPostEnabled,
    }
  );

  return (
    <Suspense fallback={<LoadingFeedList />}>
      <LatestScreenInner queryRef={query} />
    </Suspense>
  );
}
