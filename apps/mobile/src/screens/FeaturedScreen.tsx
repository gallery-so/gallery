import { Suspense, useMemo } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

import { FeaturedScreenFragment$key } from '~/generated/FeaturedScreenFragment.graphql';
import { FeaturedScreenQuery } from '~/generated/FeaturedScreenQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedList } from '../components/Feed/FeedList';

type FeaturedScreenInnerProps = {
  queryRef: FeaturedScreenFragment$key;
};

function FeaturedScreenInner({ queryRef }: FeaturedScreenInnerProps) {
  const query = useFragment(
    graphql`
      fragment FeaturedScreenFragment on Query {
        trendingFeed(before: $globalFeedBefore, last: $globalFeedCount) {
          edges {
            node {
              __typename

              ...FeedListFragment
            }
          }
        }
      }
    `,
    queryRef
  );

  const events = useMemo(() => {
    return removeNullValues(query.trendingFeed?.edges?.map((it) => it?.node)).reverse();
  }, [query.trendingFeed?.edges]);

  return <FeedList feedEventRefs={events} />;
}

export function FeaturedScreen() {
  const query = useLazyLoadQuery<FeaturedScreenQuery>(
    graphql`
      query FeaturedScreenQuery($globalFeedBefore: String, $globalFeedCount: Int!) {
        ...FeaturedScreenFragment
      }
    `,
    { globalFeedCount: 50 }
  );

  return (
    <Suspense fallback={null}>
      <FeaturedScreenInner queryRef={query} />
    </Suspense>
  );
}
