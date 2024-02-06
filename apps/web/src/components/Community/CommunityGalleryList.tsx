import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import { removeNullValues } from 'shared/relay/removeNullValues';
import styled from 'styled-components';

import { LIST_ITEM_PER_PAGE } from '~/constants/community';
import { GLOBAL_FOOTER_HEIGHT } from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { CommunityGalleryListFragment$key } from '~/generated/CommunityGalleryListFragment.graphql';
import { CommunityGalleryListQueryFragment$key } from '~/generated/CommunityGalleryListQueryFragment.graphql';

import breakpoints from '../core/breakpoints';
import Loader from '../core/Loader/Loader';
import { VStack } from '../core/Spacer/Stack';
import { CommunityGalleryListItem } from './CommunityGalleryListItem';

type Props = {
  communityRef: CommunityGalleryListFragment$key;
  queryRef: CommunityGalleryListQueryFragment$key;
};

export function CommunityGalleryList({ communityRef, queryRef }: Props) {
  const {
    data: community,
    loadNext,
    hasNext,
  } = usePaginationFragment(
    graphql`
      fragment CommunityGalleryListFragment on Community
      @refetchable(queryName: "CommunityGalleriesListRefetchableFragment") {
        galleries(first: $listOwnersFirst, after: $listOwnersAfter, maxPreviews: 5)
          @connection(key: "CommunityGalleriesList_galleries") {
          edges {
            node {
              __typename
              gallery {
                dbid
              }
              ...CommunityGalleryListItemFragment
            }
          }
        }
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityGalleryListQueryFragment on Query {
        ...CommunityGalleryListItemQueryFragment
      }
    `,
    queryRef
  );

  const [isFetching, setIsFetching] = useState(false);

  const nonNullGalleries = useMemo(() => {
    return removeNullValues(community?.galleries?.edges?.map((edge) => edge?.node));
  }, [community?.galleries?.edges]);

  const handleSeeMore = useCallback(() => {
    setIsFetching(true);
    loadNext(LIST_ITEM_PER_PAGE, {
      onComplete: () => {
        setIsFetching(false);
      },
    });
  }, [loadNext]);

  useEffect(() => {
    function handleScrollPosition() {
      const pixelsFromBottomOfPage =
        document.body.offsetHeight - window.pageYOffset - window.innerHeight;
      if (pixelsFromBottomOfPage < GLOBAL_FOOTER_HEIGHT && hasNext && !isFetching) {
        handleSeeMore();
      }
    }

    window.addEventListener('scroll', handleScrollPosition);

    return () => window.removeEventListener('scroll', handleScrollPosition);
  }, [handleSeeMore, hasNext, isFetching]);

  return (
    <VStack gap={56}>
      <StyledCommunityGalleryListItemWrapper>
        {nonNullGalleries.map((gallery) => (
          <CommunityGalleryListItem
            key={gallery.gallery?.dbid}
            communityGalleryRef={gallery}
            queryRef={query}
          />
        ))}
      </StyledCommunityGalleryListItemWrapper>

      {isFetching && (
        <VStack align="center" justify="center">
          <Loader inverted size="small" />
        </VStack>
      )}
    </VStack>
  );
}

const StyledCommunityGalleryListItemWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 16px;

  @media only screen and ${breakpoints.desktop} {
    grid-template-columns: repeat(4, 1fr);
  }
`;
