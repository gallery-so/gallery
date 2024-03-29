import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import colors from 'shared/theme/colors';
import { truncateAddress } from 'shared/utils/wallet';
import styled from 'styled-components';

import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { BookmarkedTokenGridItemFragment$key } from '~/generated/BookmarkedTokenGridItemFragment.graphql';
import { BookmarkedTokenGridItemQueryFragment$key } from '~/generated/BookmarkedTokenGridItemQueryFragment.graphql';
import { getCommunityUrlFromCommunity } from '~/utils/getCommunityUrl';

import GalleryLink from '../core/GalleryLink/GalleryLink';
import { VStack } from '../core/Spacer/Stack';
import { BaseM, TitleXS } from '../core/Text/Text';
import NftPreview from '../NftPreview/NftPreview';

type Props = {
  queryRef: BookmarkedTokenGridItemQueryFragment$key;
  tokenRef: BookmarkedTokenGridItemFragment$key;
  onNftLoad?: () => void;
};

export default function BookmarkedTokenGridItem({ queryRef, tokenRef, onNftLoad }: Props) {
  const query = useFragment(
    graphql`
      fragment BookmarkedTokenGridItemQueryFragment on Query {
        ...NftPreviewQueryFragment
      }
    `,
    queryRef
  );

  const token = useFragment(
    graphql`
      fragment BookmarkedTokenGridItemFragment on Token {
        definition {
          name
          community {
            name
            ...getCommunityUrlFromCommunityFragment
          }
          contract {
            contractAddress {
              address
            }
          }
        }
        ...NftPreviewFragment
      }
    `,
    tokenRef
  );

  const communityUrl = useMemo(
    () =>
      token.definition.community ? getCommunityUrlFromCommunity(token.definition.community) : '',
    [token.definition.community]
  );

  const contractAddress = token.definition.contract?.contractAddress?.address ?? '';

  const collectionName = useMemo(
    () => token.definition.community?.name || truncateAddress(contractAddress),
    [contractAddress, token.definition.community?.name]
  );

  return (
    <VStack gap={8} justify="flex-end">
      <div>
        <ShimmerProvider>
          <NftPreview
            queryRef={query}
            tokenRef={token}
            eventContext={contexts.UserGallery}
            onLoad={onNftLoad}
          />
        </ShimmerProvider>
      </div>
      <div>
        <TitleXS color={colors.metal}>COLLECTION</TitleXS>
        {communityUrl && (
          <GalleryLink to={communityUrl}>
            <StyledCollectionName>{collectionName}</StyledCollectionName>
          </GalleryLink>
        )}
      </div>
    </VStack>
  );
}

const StyledCollectionName = styled(BaseM)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 40px;
  max-height: 40px;
  font-weight: 700;
`;
