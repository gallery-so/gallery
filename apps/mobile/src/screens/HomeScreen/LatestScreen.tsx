import { Suspense, useCallback, useMemo } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesList';
import { LatestScreenFragment$key } from '~/generated/LatestScreenFragment.graphql';
import { LatestScreenQuery } from '~/generated/LatestScreenQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedList } from '../../components/Feed/FeedList';
import { LoadingFeedList } from '../../components/Feed/LoadingFeedList';
import { useRefreshHandle } from '../../hooks/useRefreshHandle';

type LatestScreenInnerProps = {
  queryRef: LatestScreenFragment$key;
};

const PER_PAGE = 20;

function LatestScreenInner({ queryRef }: LatestScreenInnerProps) {
  const {
    data: query,
    isLoadingPrevious,
    hasPrevious,
    loadPrevious,
    refetch,
  } = usePaginationFragment(
    graphql`
      fragment LatestScreenFragment on Query
      @refetchable(queryName: "RefetchableLatestScreenFragmentQuery") {
        globalFeed(before: $globalFeedBefore, last: $globalFeedCount)
          @connection(key: "LatestScreenFragment_globalFeed") {
          edges {
            node {
              __typename

              ...FeedListFragment
            }
          }
        }

        ...FeedListQueryFragment
      }
    `,
    queryRef
  );

  const { isRefreshing, handleRefresh } = useRefreshHandle(refetch);

  const handleLoadMore = useCallback(() => {
    if (hasPrevious && !isLoadingPrevious) {
      loadPrevious(PER_PAGE);
    }
  }, [hasPrevious, isLoadingPrevious, loadPrevious]);

  const events = useMemo(() => {
    return removeNullValues(query.globalFeed?.edges?.map((it) => it?.node)).reverse();
  }, [query.globalFeed?.edges]);

  return (
    <FeedList
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      isLoadingMore={isLoadingPrevious}
      onLoadMore={handleLoadMore}
      feedEventRefs={events}
      queryRef={query}
    />
  );
}

export function LatestScreen() {
  const query = useLazyLoadQuery<LatestScreenQuery>(
    graphql`
      query LatestScreenQuery(
        $globalFeedBefore: String
        $globalFeedCount: Int!
        $interactionsFirst: Int!
        $interactionsAfter: String
      ) {
        ...LatestScreenFragment
      }
    `,
    {
      globalFeedCount: PER_PAGE,
      interactionsFirst: NOTES_PER_PAGE,
    }
  );

  return (
    <Suspense fallback={<LoadingFeedList />}>
      <LatestScreenInner queryRef={query} />
    </Suspense>
  );
}
