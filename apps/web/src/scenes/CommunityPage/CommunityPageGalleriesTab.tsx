import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { CommunityGalleryList } from '~/components/Community/CommunityGalleryList';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleS } from '~/components/core/Text/Text';
import { CommunityPageGalleriesTabFragment$key } from '~/generated/CommunityPageGalleriesTabFragment.graphql';
import { CommunityPageGalleriesTabQueryFragment$key } from '~/generated/CommunityPageGalleriesTabQueryFragment.graphql';

type Props = {
  communityRef: CommunityPageGalleriesTabFragment$key;
  queryRef: CommunityPageGalleriesTabQueryFragment$key;
};

export function CommunityPageGalleriesTab({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPageGalleriesTabFragment on Community {
        ...CommunityGalleryListFragment
        name
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityPageGalleriesTabQueryFragment on Query {
        ...CommunityGalleryListQueryFragment
      }
    `,
    queryRef
  );

  return (
    <StyledGalleriesTab>
      <HStack align="center" justify="space-between">
        <TitleS>Galleries that feature {community.name ?? 'this collection'}</TitleS>
      </HStack>
      <StyledGalleriesWrapper>
        <CommunityGalleryList communityRef={community} queryRef={query} />
      </StyledGalleriesWrapper>
    </StyledGalleriesTab>
  );
}

const StyledGalleriesTab = styled.div`
  padding-top: 10px;
  padding-bottom: 56px;
`;

const StyledGalleriesWrapper = styled(VStack)`
  padding-top: 24px;
`;
