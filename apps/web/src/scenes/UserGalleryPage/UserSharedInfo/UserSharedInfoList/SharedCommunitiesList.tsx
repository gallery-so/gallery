import { useCallback, useMemo } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import { AutoSizer, InfiniteLoader, List, ListRowRenderer } from 'react-virtualized';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import CommunityHoverCard from '~/components/HoverCard/CommunityHoverCard';
import CommunityProfilePicture from '~/components/ProfilePicture/CommunityProfilePicture';
import { SharedCommunitiesListFragment$key } from '~/generated/SharedCommunitiesListFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { LowercaseChain } from '~/shared/utils/chains';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';
import unescape from '~/shared/utils/unescape';
import { getUrlForCommunity } from '~/utils/getCommunityUrlForToken';

import { COMMUNITIES_PER_PAGE } from '../UserSharedCommunities';
import PaginatedListRow from './SharedInfoListRow';

type Props = {
  userRef: SharedCommunitiesListFragment$key;
};

const ROW_HEIGHT = 56;
const MAX_LIST_HEIGHT = 640;

export default function SharedCommunitiesList({ userRef }: Props) {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment SharedCommunitiesListFragment on GalleryUser
      @refetchable(queryName: "RefetchableSharedCommunitiesListFragment") {
        sharedCommunities(first: $sharedCommunitiesFirst, after: $sharedCommunitiesAfter)
          @connection(key: "SharedCommunitiesListFragment_sharedCommunities") {
          edges {
            node {
              __typename
              name
              description
              ...CommunityProfilePictureFragment
              ...CommunityHoverCardFragment
              ...extractRelevantMetadataFromCommunityFragment
            }
          }
        }
      }
    `,
    userRef
  );

  const sharedCommunities = useMemo(
    () => data.sharedCommunities?.edges ?? [],
    [data.sharedCommunities?.edges]
  );

  const rowCount = hasNext ? sharedCommunities.length + 1 : sharedCommunities.length;

  const handleLoadMore = useCallback(async () => {
    loadNext(COMMUNITIES_PER_PAGE);
  }, [loadNext]);

  const isRowLoaded = ({ index }: { index: number }) =>
    !hasNext || index < sharedCommunities.length;

  const isMobile = useIsMobileWindowWidth();

  const listHeight = useMemo(() => {
    // 60px accounts for the header + margin height on mobile
    const modalMaxHeight = isMobile ? window.innerHeight - 60 : MAX_LIST_HEIGHT;
    return Math.min(rowCount * ROW_HEIGHT, modalMaxHeight);
  }, [isMobile, rowCount]);

  const rowRenderer = useCallback<ListRowRenderer>(
    ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
      const community = sharedCommunities[index]?.node;
      if (!community) {
        return null;
      }

      const { chain, contractAddress } = extractRelevantMetadataFromCommunity(community);

      const unescapedDescription = community.description ? unescape(community.description) : '';
      const descriptionFirstLine = unescapedDescription.split('\n')[0] ?? '';
      const communityUrlPath =
        contractAddress && chain
          ? getUrlForCommunity(contractAddress, chain?.toLowerCase() as LowercaseChain)
          : null;

      const displayName = community.name || contractAddress || 'Untitled Contract';

      if (!displayName && !descriptionFirstLine) {
        return null;
      }

      return (
        <div style={style} key={key}>
          <CommunityHoverCard
            communityRef={community}
            communityName={displayName}
            fitContent={false}
          >
            <PaginatedListRow
              title={community.name ?? ''}
              subTitle={descriptionFirstLine}
              href={communityUrlPath}
              imageContent={<CommunityProfilePicture communityRef={community} size="md" />}
            />
          </CommunityHoverCard>
        </div>
      );
    },
    [sharedCommunities]
  );

  return (
    <StyledList fullscreen={isMobile} gap={24}>
      <AutoSizer disableHeight>
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
                rowHeight={56}
                rowCount={sharedCommunities.length}
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
  height: 100%;
`;
