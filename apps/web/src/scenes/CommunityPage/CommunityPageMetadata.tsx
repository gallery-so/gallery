import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleXS } from '~/components/core/Text/Text';
import { chains } from '~/components/GalleryEditor/PiecesSidebar/chains';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { RawProfilePicture } from '~/components/ProfilePicture/RawProfilePicture';
import { CommunityPageMetadataFragment$key } from '~/generated/CommunityPageMetadataFragment.graphql';
import colors from '~/shared/theme/colors';
import { getExternalAddressLink, truncateAddress } from '~/shared/utils/wallet';

type Props = {
  communityRef: CommunityPageMetadataFragment$key;
  isKoalaEnabled: boolean;
};

export default function CommunityPageMetadata({ communityRef, isKoalaEnabled }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPageMetadataFragment on Community {
        contractAddress {
          chain
          address
          ...walletGetExternalAddressLinkFragment
        }
        postsCount: posts(last: 0) {
          pageInfo {
            total
          }
        }
        creator {
          __typename
          ... on GalleryUser {
            username
            universal

            ...ProfilePictureFragment
          }
          ... on ChainAddress {
            address
            ...walletGetExternalAddressLinkFragment
          }
        }
      }
    `,
    communityRef
  );

  const { contractAddress, creator } = community;

  const creatorUsername = creator?.__typename === 'GalleryUser' && creator?.username;

  const creatorAddress = useMemo(() => {
    return creator?.__typename === 'ChainAddress' && creator?.address;
  }, [creator]);

  const creatorExternalLink = useMemo(() => {
    if (!creator || creator.__typename !== 'ChainAddress') return null;
    return getExternalAddressLink(creator);
  }, [creator]);

  // handle universal users
  const creatorRoute: Route = useMemo(() => {
    return {
      pathname: '/[username]',
      query: { username: creatorUsername || '' },
    };
  }, [creatorUsername]);

  const networkIcon = useMemo(() => {
    return chains.find((chain) => chain.name === contractAddress?.chain)?.icon;
  }, [contractAddress?.chain]);

  const CreatorLink = useMemo(() => {
    if (community.creator?.__typename === 'GalleryUser' && !community.creator?.universal) {
      return (
        <HStack align="center" gap={4}>
          <ProfilePicture userRef={community.creator} size="xs" />
          <StyledLink href={creatorRoute}>
            <BaseM color={colors.shadow}>{creatorUsername}</BaseM>
          </StyledLink>
        </HStack>
      );
    }
    if (creatorExternalLink) {
      return (
        <InteractiveLink href={creatorExternalLink}>
          <HStack gap={4}>
            <RawProfilePicture size="xs" default inheritBorderColor />

            <StyledBaseM>{truncateAddress(creatorAddress || '')}</StyledBaseM>
          </HStack>
        </InteractiveLink>
      );
    }
    return null;
  }, [community.creator, creatorExternalLink, creatorRoute, creatorUsername, creatorAddress]);

  return (
    <HStack gap={48}>
      {CreatorLink && (
        <VStack gap={2}>
          <TitleXS>CREATED BY</TitleXS>
          {CreatorLink}
        </VStack>
      )}
      <VStack gap={2}>
        <TitleXS>NETWORK</TitleXS>
        <HStack align="center" gap={4}>
          <StyledNetworkIcon src={networkIcon} />
          <BaseM color={colors.shadow}>{contractAddress?.chain}</BaseM>
        </HStack>
      </VStack>
      {isKoalaEnabled && (
        <VStack gap={2}>
          <TitleXS>Posts</TitleXS>
          <BaseM color={colors.shadow}>{community.postsCount?.pageInfo.total}</BaseM>
        </VStack>
      )}
    </HStack>
  );
}

const StyledNetworkIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const StyledBaseM = styled(BaseM)`
  color: inherit;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;
