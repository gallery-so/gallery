import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleXS } from '~/components/core/Text/Text';
import { PostComposerModalWithSelector } from '~/components/Posts/PostComposerModal';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { RawProfilePicture } from '~/components/ProfilePicture/RawProfilePicture';
import { useIsMemberOfCommunity } from '~/contexts/communityPage/IsMemberOfCommunityContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommunityPageMetadataFragment$key } from '~/generated/CommunityPageMetadataFragment.graphql';
import { CommunityPageMetadataQueryFragment$key } from '~/generated/CommunityPageMetadataQueryFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { PlusSquareIcon } from '~/icons/PlusSquareIcon';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { chains } from '~/shared/utils/chains';
import { getExternalAddressLink, truncateAddress } from '~/shared/utils/wallet';

import CommunityPageOwnershipRequiredModal from './CommunityPageOwnershipRequiredModal';

type Props = {
  communityRef: CommunityPageMetadataFragment$key;
  queryRef: CommunityPageMetadataQueryFragment$key;
};

export default function CommunityPageMetadata({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPageMetadataFragment on Community {
        name
        contractAddress {
          chain
          address
          ...walletGetExternalAddressLinkFragment
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
        ...CommunityPageOwnershipRequiredModalFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityPageMetadataQueryFragment on Query {
        viewer {
          __typename
        }
      }
    `,
    queryRef
  );

  const { contractAddress, creator } = community;

  const creatorUsername = creator?.__typename === 'GalleryUser' && creator?.username;
  const creatorAddress = creator?.__typename === 'ChainAddress' && creator?.address;

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

  const { isMemberOfCommunity, refetchIsMemberOfCommunity } = useIsMemberOfCommunity();

  const { showModal } = useModalActions();
  const isMobile = useIsMobileWindowWidth();

  const handleCreatePostClick = useCallback(() => {
    if (query?.viewer?.__typename !== 'Viewer') {
      return;
    }

    showModal({
      content: (
        <PostComposerModalWithSelector
          preSelectedContract={{
            title: community.name ?? '',
            address: community.contractAddress?.address ?? '', // ok to proceed to post composer even if contractAddress is missing (unlikely). user will just be prompted to select a token
          }}
        />
      ),
      headerVariant: 'thicc',
      isFullPage: isMobile,
    });
  }, [showModal, query, community.name, community.contractAddress?.address, isMobile]);

  const handleDisabledPostButtonClick = useCallback(() => {
    showModal({
      content: (
        <CommunityPageOwnershipRequiredModal
          communityRef={community}
          refetchIsMemberOfCommunity={refetchIsMemberOfCommunity}
        />
      ),
      headerText: 'Ownership required',
    });
  }, [community, refetchIsMemberOfCommunity, showModal]);

  const showPostButton = query.viewer?.__typename === 'Viewer';

  const CreatorLink = useMemo(() => {
    if (community.creator?.__typename === 'GalleryUser' && !community.creator?.universal) {
      return (
        <HStack align="center" gap={4}>
          <ProfilePicture userRef={community.creator} size="xs" />
          <GalleryLink
            to={creatorRoute}
            eventElementId="Creator Username Link"
            eventName="Creator Username Link Click"
            eventContext={contexts.Community}
          >
            <BaseM color={colors.shadow}>{creatorUsername}</BaseM>
          </GalleryLink>
        </HStack>
      );
    }
    if (creatorExternalLink) {
      return (
        <GalleryLink
          href={creatorExternalLink}
          eventElementId="Creator External Link"
          eventName="Creator External Link Click"
          eventContext={contexts.Community}
        >
          <HStack gap={4}>
            <RawProfilePicture size="xs" default inheritBorderColor />

            <StyledBaseM>{truncateAddress(creatorAddress || '')}</StyledBaseM>
          </HStack>
        </GalleryLink>
      );
    }
    return null;
  }, [community.creator, creatorExternalLink, creatorRoute, creatorUsername, creatorAddress]);

  return (
    <StyledMetadata align="center">
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
      {showPostButton &&
        (isMemberOfCommunity ? (
          <StyledPostButton
            eventElementId="Community Page Create Post Button"
            eventName="Community Page Create Post"
            eventContext={contexts.Community}
            onClick={handleCreatePostClick}
          >
            <HStack align="center" gap={4}>
              <PlusSquareIcon stroke={colors.white} height={16} width={16} />
              Post
            </HStack>
          </StyledPostButton>
        ) : (
          <StyledDisabledPostButton
            eventElementId="Community Page Disabled Post Button"
            eventName="Community Page Disabled Post Click"
            eventContext={contexts.Community}
            onClick={handleDisabledPostButtonClick}
          >
            <HStack align="center" gap={4}>
              <PlusSquareIcon stroke={colors.metal} height={16} width={16} />
              Post
            </HStack>
          </StyledDisabledPostButton>
        ))}
    </StyledMetadata>
  );
}

const StyledMetadata = styled(HStack)`
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 0; // vertical gap in case the screen is so narrow the row wraps

  @media only screen and ${breakpoints.tablet} {
    justify-content: flex-start;
    flex-wrap: nowrap;
    gap: 0 48px;
  }

  @media only screen and ${breakpoints.mobileLarge} {
    gap: 8px 48px;
  }

  width: 100%;
`;

const StyledNetworkIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const StyledBaseM = styled(BaseM)`
  color: inherit;
`;

const StyledPostButton = styled(Button)`
  width: 100px;
  height: 32px;
`;

const StyledDisabledPostButton = styled(Button)`
  width: 100px;
  height: 32px;
  background-color: ${colors.porcelain};
  color: ${colors.metal};
`;
