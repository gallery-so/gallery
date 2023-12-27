import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';

import Loader from '~/components/core/Loader/Loader';
import { VStack } from '~/components/core/Spacer/Stack';
import TokenHolderList from '~/components/TokenHolderList/TokenHolderList';
import { LIST_ITEM_PER_PAGE } from '~/constants/community';
import { GLOBAL_FOOTER_HEIGHT } from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { CommunityHolderListFragment$key } from '~/generated/CommunityHolderListFragment.graphql';

type Props = {
  communityRef: CommunityHolderListFragment$key;
};

export default function CommunityHolderList({ communityRef }: Props) {
  const {
    data: community,
    loadNext,
    hasNext,
  } = usePaginationFragment(
    graphql`
      fragment CommunityHolderListFragment on Community
      @refetchable(queryName: "CommunityHolderListRefetchableFragment") {
        holders(first: $listOwnersFirst, after: $listOwnersAfter)
          @connection(key: "CommunityPageView_holders") {
          edges {
            node {
              __typename

              user {
                universal
              }

              ...TokenHolderListFragment
            }
          }
        }
      }
    `,
    communityRef
  );

  const [isFetching, setIsFetching] = useState(false);

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

  const nonNullTokenHolders = useMemo(() => {
    const holders = [];

    for (const owner of community?.holders?.edges ?? []) {
      if (owner?.node) {
        holders.push(owner.node);
      }
    }

    return holders;
  }, [community?.holders?.edges]);

  const galleryMembers = useMemo(() => {
    return nonNullTokenHolders.filter((holder) => {
      return !holder?.user?.universal;
    });
  }, [nonNullTokenHolders]);

  const nonGalleryMembers = useMemo(() => {
    return nonNullTokenHolders.filter((holder) => {
      return holder?.user?.universal;
    });
  }, [nonNullTokenHolders]);

  return (
    <div>
      <StyledListWrapper>
        {galleryMembers.length > 0 && (
          <TokenHolderList title="Collectors on Gallery" tokenHoldersRef={galleryMembers} />
        )}
        {nonGalleryMembers.length > 0 && (
          <TokenHolderList title="Other owners" tokenHoldersRef={nonGalleryMembers} />
        )}

        {isFetching && (
          <VStack align="center" justify="center">
            <Loader inverted size="small" />
          </VStack>
        )}
      </StyledListWrapper>
    </div>
  );
}

const StyledListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
