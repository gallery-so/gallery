import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleXS } from '~/components/core/Text/Text';
import { MintLinkButton } from '~/components/MintLinkButton';
import { PostComposerModalWithSelector } from '~/components/Posts/PostComposerModal';
import { CreatorProfilePictureAndUsernameOrAddress } from '~/components/ProfilePicture/ProfilePictureAndUserOrAddress';
import { useIsMemberOfCommunity } from '~/contexts/communityPage/IsMemberOfCommunityContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommunityPageMetadataFragment$key } from '~/generated/CommunityPageMetadataFragment.graphql';
import { CommunityPageMetadataQueryFragment$key } from '~/generated/CommunityPageMetadataQueryFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { PlusSquareIcon } from '~/icons/PlusSquareIcon';
import { contexts, flows } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { chains } from '~/shared/utils/chains';
import {
  extractContractIdFromCommunity,
  extractRelevantMetadataFromCommunity,
} from '~/shared/utils/extractRelevantMetadataFromCommunity';

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
        creator {
          ...ProfilePictureAndUserOrAddressCreatorFragment
        }
        tokens(first: $tokenCommunityFirst, after: $tokenCommunityAfter) {
          edges {
            node {
              ...MintLinkButtonFragment
            }
          }
        }
        ...extractRelevantMetadataFromCommunityContractIdFragment
        ...extractRelevantMetadataFromCommunityFragment
        ...CommunityPageOwnershipRequiredModalFragment
      }
    `,
    communityRef
  );

  const { chain, contractAddress, mintUrl } = extractRelevantMetadataFromCommunity(community);
  const contractId = extractContractIdFromCommunity(community);

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

  const networkIcon = useMemo(() => {
    return chains.find((_chain) => _chain.name === chain)?.icon;
  }, [chain]);

  const { isMemberOfCommunity, refetchIsMemberOfCommunity } = useIsMemberOfCommunity();

  const { showModal } = useModalActions();
  const isMobile = useIsMobileWindowWidth();
  const token = community?.tokens?.edges?.[0]?.node;

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

  const handleCreatePostClick = useCallback(() => {
    if (query?.viewer?.__typename !== 'Viewer') {
      return;
    }

    if (!isMemberOfCommunity) {
      handleDisabledPostButtonClick();
      return;
    }

    showModal({
      content: (
        <PostComposerModalWithSelector
          preSelectedContract={{
            dbid: contractId,
            title: community.name ?? '',
            address: contractAddress, // ok to proceed to post composer even if contractAddress is missing (unlikely). user will just be prompted to select a token
          }}
          eventFlow={flows['Community Page Post Create Flow']}
        />
      ),
      headerVariant: 'thicc',
      isFullPage: isMobile,
    });
  }, [
    query?.viewer?.__typename,
    isMemberOfCommunity,
    showModal,
    contractId,
    community.name,
    contractAddress,
    isMobile,
    handleDisabledPostButtonClick,
  ]);

  const showPostButton = query.viewer?.__typename === 'Viewer';

  return (
    <StyledMetadata align="center">
      {community.creator && chain !== 'POAP' ? (
        <VStack gap={2}>
          <TitleXS>CREATED BY</TitleXS>
          <CreatorProfilePictureAndUsernameOrAddress
            userOrAddressRef={community.creator}
            eventContext={contexts.Community}
          />
        </VStack>
      ) : null}
      <VStack gap={2}>
        <TitleXS>NETWORK</TitleXS>
        <HStack align="center" gap={4}>
          <StyledNetworkIcon src={networkIcon} />
          <BaseM color={colors.shadow}>{chain}</BaseM>
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
          token && (
            <StyledMintButton
              size="sm"
              tokenRef={token}
              eventElementId="Click Mint Link Button"
              eventName="Click Mint Link Button"
              eventContext={contexts.Community}
              overwriteURL={mintUrl}
            />
          )
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

const StyledPostButton = styled(Button)`
  width: 100px;
  height: 32px;
`;

const StyledMintButton = styled(MintLinkButton)`
  width: 100px;
  height: 32px;
`;
