import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { EmptyState } from '~/components/EmptyState/EmptyState';
import { useTrackLoadMoreFeedEvents } from '~/components/Feed/analytics';
import { ITEMS_PER_PAGE } from '~/components/Feed/constants';
import FeedList from '~/components/Feed/FeedList';
import { UserActivityFeedFragment$key } from '~/generated/UserActivityFeedFragment.graphql';
import { UserActivityFeedQueryFragment$key } from '~/generated/UserActivityFeedQueryFragment.graphql';
import { UserFeedByUserIdPaginationQuery } from '~/generated/UserFeedByUserIdPaginationQuery.graphql';

type Props = {
  userRef: UserActivityFeedFragment$key;
  queryRef: UserActivityFeedQueryFragment$key;
};

function UserActivityFeed({ userRef, queryRef }: Props) {
  const {
    data: user,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment<UserFeedByUserIdPaginationQuery, UserActivityFeedFragment$key>(
    graphql`
      fragment UserActivityFeedFragment on GalleryUser
      @refetchable(queryName: "UserFeedByUserIdPaginationQuery") {
        feed(before: $viewerBefore, last: $viewerLast)
          @connection(key: "UserActivityFeedFragment_feed") {
          edges {
            node {
              ... on FeedEventOrError {
                __typename

                ...FeedListEventDataFragment
              }
            }
          }
        }
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment UserActivityFeedQueryFragment on Query {
        ...FeedListFragment

        feedEventById(id: $topEventId) {
          ... on FeedEvent {
            __typename
            ...FeedListEventDataFragment
          }
        }
      }
    `,
    queryRef
  );

  const trackLoadMoreFeedEvents = useTrackLoadMoreFeedEvents();

  const loadNextPage = useCallback(() => {
    return new Promise((resolve) => {
      trackLoadMoreFeedEvents('viewer');
      // Infinite scroll component wants load callback to return a promise
      loadPrevious(ITEMS_PER_PAGE, { onComplete: () => resolve('loaded') });
    });
  }, [loadPrevious, trackLoadMoreFeedEvents]);

  const feedData = useMemo(() => {
    const events = [];

    for (const edge of user.feed?.edges ?? []) {
      if (
        (edge?.node?.__typename === 'FeedEvent' || edge?.node?.__typename === 'Post') &&
        edge.node
      ) {
        events.push(edge.node);
      }
    }

    if (query.feedEventById?.__typename === 'FeedEvent') {
      events.push(query.feedEventById);
    }

    return events;
  }, [query.feedEventById, user.feed?.edges]);

  if (feedData.length === 0) {
    return (
      <EmptyState
        title={"It's quiet in here"}
        description="This user doesn't seem to have any activity yet."
      />
    );
  }

  return (
    <FeedList
      feedEventRefs={feedData}
      loadNextPage={loadNextPage}
      hasNext={hasPrevious}
      queryRef={query}
      feedMode={'USER'}
    />
  );
}

export default UserActivityFeed;
