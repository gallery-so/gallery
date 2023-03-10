import { Route } from 'nextjs-routes';
import { useCallback, useMemo, useState } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import { AutoSizer, InfiniteLoader, List, ListRowRenderer } from 'react-virtualized';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { PaginatedUsersListFragment$key } from '~/generated/PaginatedUsersListFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import unescape from '~/utils/unescape';

import PaginatedListRow from './PaginatedListRow';

type Props = {
  queryRef: PaginatedUsersListFragment$key;
};

export const FOLLOWERS_PER_PAGE = 20;

export default function PaginatedUsersList({ queryRef }: Props) {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment PaginatedUsersListFragment on GalleryUser
      @refetchable(queryName: "RefetchablePaginatedUsersListFragment") {
        sharedFollowers(first: $sharedFollowersFirst, after: $sharedFollowersAfter)
          @connection(key: "PaginatedUsersListFragment_sharedFollowers") {
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

  const rowCount = hasNext ? sharedFollowers.length + 1 : sharedFollowers.length;

  const [isFetching, setIsFetching] = useState(false);

  const handleLoadMore = useCallback(async () => {
    setIsFetching(true);
    loadNext(FOLLOWERS_PER_PAGE, {
      onComplete: () => {
        setIsFetching(false);
      },
    });
  }, [loadNext]);

  const loadMoreRows = isFetching ? () => {} : handleLoadMore;

  const isRowLoaded = ({ index }: { index: number }) => !hasNext || index < sharedFollowers.length;

  const rowRenderer = useCallback<ListRowRenderer>(
    ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
      const user = sharedFollowers[index]?.node;
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
        <div style={style} key={key}>
          <PaginatedListRow
            title={user.username ?? ''}
            subTitle={bioFirstLine}
            href={userUrlPath}
          />
        </div>
      );
    },
    [sharedFollowers]
  );

  const isMobile = useIsMobileWindowWidth();
  return (
    <StyledList fullscreen={isMobile} gap={24}>
      <AutoSizer>
        {({ width, height }) => (
          <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={rowCount}>
            {({ onRowsRendered, registerChild }) => (
              <List
                ref={registerChild}
                onRowsRendered={onRowsRendered}
                rowRenderer={rowRenderer}
                width={width}
                height={height}
                rowHeight={56}
                rowCount={sharedFollowers.length}
              />
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>

      <VStack></VStack>
    </StyledList>
  );
}

const StyledList = styled(VStack)<{ fullscreen: boolean }>`
  width: 375px;
  max-width: 375px;
  margin: 4px;
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
`;
