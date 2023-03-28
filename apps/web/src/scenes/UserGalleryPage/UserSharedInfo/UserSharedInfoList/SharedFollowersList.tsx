import { useVirtualizer } from '@tanstack/react-virtual';
import { Route } from 'nextjs-routes';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import VirtualizeContainer from '~/components/Virtualize/VirtualizeContainer';
import { SharedFollowersListFragment$key } from '~/generated/SharedFollowersListFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import unescape from '~/utils/unescape';

import PaginatedListRow from './SharedInfoListRow';

type Props = {
  queryRef: SharedFollowersListFragment$key;
};

export const FOLLOWERS_PER_PAGE = 20;

export default function SharedFollowersList({ queryRef }: Props) {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment SharedFollowersListFragment on GalleryUser
      @refetchable(queryName: "RefetchableSharedFollowersListFragment") {
        sharedFollowers(first: $sharedFollowersFirst, after: $sharedFollowersAfter)
          @connection(key: "SharedFollowersListFragment_sharedFollowers") {
          edges {
            node {
              __typename

              username
              bio
            }
          }
        }
      }
    `,
    queryRef
  );

  const sharedFollowers = useMemo(
    () => data.sharedFollowers?.edges ?? [],
    [data.sharedFollowers?.edges]
  );

  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: sharedFollowers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const handleLoadMore = useCallback(async () => {
    setIsFetchingNextPage(true);
    loadNext(FOLLOWERS_PER_PAGE);
    setIsFetchingNextPage(false);
  }, [loadNext]);

  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= sharedFollowers.length - 1 && hasNext && !isFetchingNextPage) {
      handleLoadMore();
    }
  }, [handleLoadMore, hasNext, isFetchingNextPage, sharedFollowers.length, virtualizer]);

  const isMobile = useIsMobileWindowWidth();
  return (
    <StyledList fullscreen={isMobile} gap={24}>
      <VirtualizeContainer virtualizer={virtualizer} ref={parentRef}>
        {virtualItems.map((item) => {
          const user = sharedFollowers[item.index]?.node;

          if (!user) {
            return null;
          }

          const unescapedBio = user.bio ? unescape(user.bio) : '';
          const bioFirstLine = unescapedBio.split('\n')[0] ?? '';

          const userUrlPath: Route = {
            pathname: `/[username]`,
            query: { username: user.username ?? '' },
          };

          return (
            <div data-index={item.index} ref={virtualizer.measureElement} key={item.key}>
              <PaginatedListRow
                title={user.username ?? ''}
                subTitle={bioFirstLine}
                href={userUrlPath}
              />
            </div>
          );
        })}
      </VirtualizeContainer>
    </StyledList>
  );
}

const StyledList = styled(VStack)<{ fullscreen: boolean }>`
  width: 375px;
  max-width: 375px;
  margin: 4px;
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
`;
