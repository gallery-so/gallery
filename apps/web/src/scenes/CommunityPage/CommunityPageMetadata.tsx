import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleXS } from '~/components/core/Text/Text';
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
        chain
        contract {
          dbid
        }
        contractAddress {
          chain
          address
        }
        creator {
          ...ProfilePictureAndUserOrAddressCreatorFragment
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

  const networkIcon = useMemo(() => {
    return chains.find((chain) => chain.name === community.contractAddress?.chain)?.icon;
  }, [community.contractAddress?.chain]);

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
            dbid: community.contract?.dbid ?? '',
            title: community.name ?? '',
            address: community.contractAddress?.address ?? '', // ok to proceed to post composer even if contractAddress is missing (unlikely). user will just be prompted to select a token
          }}
          eventFlow={flows['Community Page Post Create Flow']}
        />
      ),
      headerVariant: 'thicc',
      isFullPage: isMobile,
    });
  }, [
    showModal,
    query,
    community.name,
    community.contractAddress?.address,
    community.contract?.dbid,
    isMobile,
  ]);

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

  return (
    <StyledMetadata align="center">
      {community.creator && community?.chain !== 'POAP' ? (
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
          <BaseM color={colors.shadow}>{community.contractAddress?.chain}</BaseM>
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
