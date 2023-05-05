import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesList';
import { LatestScreenFragment$key } from '~/generated/LatestScreenFragment.graphql';
import { LatestScreenQuery } from '~/generated/LatestScreenQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedList } from '../../components/Feed/FeedList';
import { LoadingFeedList } from '../../components/Feed/LoadingFeedList';

type LatestScreenInnerProps = {
  queryRef: LatestScreenFragment$key;
};

const PER_PAGE = 20;
const INITIAL_COUNT = 3;

function LatestScreenInner({ queryRef }: LatestScreenInnerProps) {
  const {
    data: query,
    isLoadingPrevious,
    hasPrevious,
    loadPrevious,
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

  useEffect(() => {
    if (hasPrevious && !isLoadingPrevious) {
      loadPrevious(PER_PAGE - INITIAL_COUNT);
    }
  }, [hasPrevious, isLoadingPrevious, loadPrevious]);

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
      globalFeedCount: INITIAL_COUNT,
      interactionsFirst: NOTES_PER_PAGE,
    }
  );

  return (
    <Suspense fallback={<LoadingFeedList />}>
      <LatestScreenInner queryRef={query} />
    </Suspense>
  );
}
