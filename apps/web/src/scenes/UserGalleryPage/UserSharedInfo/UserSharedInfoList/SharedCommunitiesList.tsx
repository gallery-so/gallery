import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import VirtualizeContainer from '~/components/Virtualize/VirtualizeContainer';
import { SharedCommunitiesListFragment$key } from '~/generated/SharedCommunitiesListFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { getUrlForCommunity } from '~/utils/getCommunityUrlForToken';
import unescape from '~/utils/unescape';

import { COMMUNITIES_PER_PAGE } from '../UserSharedCommunities';
import PaginatedListRow from './SharedInfoListRow';

type Props = {
  queryRef: SharedCommunitiesListFragment$key;
};
export default function SharedCommunitiesList({ queryRef }: Props) {
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
              contractAddress {
                address
              }
              chain
            }
          }
        }
      }
    `,
    queryRef
  );

  const sharedCommunities = useMemo(
    () => data.sharedCommunities?.edges ?? [],
    [data.sharedCommunities?.edges]
  );

  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: sharedCommunities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const handleLoadMore = useCallback(async () => {
    setIsFetchingNextPage(true);
    loadNext(COMMUNITIES_PER_PAGE);
    setIsFetchingNextPage(false);
  }, [loadNext]);

  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= sharedCommunities.length - 1 && hasNext && !isFetchingNextPage) {
      handleLoadMore();
    }
  }, [handleLoadMore, hasNext, isFetchingNextPage, sharedCommunities.length, virtualizer]);

  const isMobile = useIsMobileWindowWidth();

  return (
    <StyledList fullscreen={isMobile} gap={24}>
      <VirtualizeContainer virtualizer={virtualizer} ref={parentRef}>
        {virtualItems.map((item) => {
          const community = sharedCommunities[item.index]?.node;

          if (!community) {
            return null;
          }

          const unescapedDescription = community.description ? unescape(community.description) : '';
          const descriptionFirstLine = unescapedDescription.split('\n')[0] ?? '';

          const communityUrlPath =
            community.contractAddress?.address && community.chain
              ? getUrlForCommunity(community.contractAddress?.address, community.chain)
              : null;

          if (!community.name && !descriptionFirstLine) {
            return null;
          }

          return (
            <div data-index={item.index} ref={virtualizer.measureElement} key={item.key}>
              <PaginatedListRow
                title={community.name ?? ''}
                subTitle={descriptionFirstLine}
                href={communityUrlPath}
              />
            </div>
          );
        })}
      </VirtualizeContainer>
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
