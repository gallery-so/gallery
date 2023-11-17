import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import { AutoSizer, InfiniteLoader, List, ListRowRenderer } from 'react-virtualized';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SharedFollowersListFragment$key } from '~/generated/SharedFollowersListFragment.graphql';
import { SharedFollowersListRowFragment$key } from '~/generated/SharedFollowersListRowFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import unescape from '~/shared/utils/unescape';

import PaginatedListRow from './SharedInfoListRow';

type Props = {
  userRef: SharedFollowersListFragment$key;
};

export const FOLLOWERS_PER_PAGE = 20;
const ROW_HEIGHT = 56;
const MAX_LIST_HEIGHT = 400;

export default function SharedFollowersList({ userRef }: Props) {
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
              ...SharedFollowersListRowFragment
            }
          }
        }
      }
    `,
    userRef
  );

  const sharedFollowers = useMemo(
    () => data.sharedFollowers?.edges ?? [],
    [data.sharedFollowers?.edges]
  );

  const rowCount = hasNext ? sharedFollowers.length + 1 : sharedFollowers.length;

  const handleLoadMore = useCallback(async () => {
    loadNext(FOLLOWERS_PER_PAGE);
  }, [loadNext]);

  const isRowLoaded = ({ index }: { index: number }) => !hasNext || index < sharedFollowers.length;

  const rowRenderer = useCallback<ListRowRenderer>(
    ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
      const user = sharedFollowers[index]?.node;
      if (!user) {
        return null;
      }

      return (
        <div style={style} key={key}>
          <SharedFollowersListRow userRef={user} />
        </div>
      );
    },
    [sharedFollowers]
  );

  const listHeight = useMemo(() => {
    return Math.min(rowCount * ROW_HEIGHT, MAX_LIST_HEIGHT);
  }, [rowCount]);

  const isMobile = useIsMobileWindowWidth();
  return (
    <StyledList fullscreen={isMobile} gap={24}>
      <AutoSizer>
        {({ width }) => (
          <InfiniteLoader
            isRowLoaded={isRowLoaded}
            loadMoreRows={handleLoadMore}
            rowCount={rowCount}
          >
            {({ onRowsRendered, registerChild }) => (
              <List
                ref={registerChild}
                onRowsRendered={onRowsRendered}
                rowRenderer={rowRenderer}
                width={width}
                height={listHeight}
                rowHeight={ROW_HEIGHT}
                rowCount={sharedFollowers.length}
              />
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </StyledList>
  );
}

const StyledList = styled(VStack)<{ fullscreen: boolean }>`
  width: 375px;
  max-width: 375px;
  margin: 4px;
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '400px')};
`;

function SharedFollowersListRow({ userRef }: { userRef: SharedFollowersListRowFragment$key }) {
  const user = useFragment(
    graphql`
      fragment SharedFollowersListRowFragment on GalleryUser {
        username
        bio
        ...ProfilePictureFragment
        ...UserHoverCardFragment
      }
    `,
    userRef
  );

  const unescapedBio = user.bio ? unescape(user.bio) : '';
  const bioFirstLine = unescapedBio.split('\n')[0] ?? '';

  const userUrlPath: Route = {
    pathname: `/[username]`,
    query: { username: user.username ?? '' },
  };

  return (
    <UserHoverCard userRef={user} fitContent={false}>
      <PaginatedListRow
        href={userUrlPath}
        title={user.username ?? ''}
        subTitle={bioFirstLine}
        imageContent={<ProfilePicture userRef={user} size="md" />}
      />
    </UserHoverCard>
  );
}
