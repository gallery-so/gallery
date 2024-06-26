import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints, { size } from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import HorizontalBreak from '~/components/core/HorizontalBreak/HorizontalBreak';
import IconContainer from '~/components/core/IconContainer';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM, TitleM, TitleXS } from '~/components/core/Text/Text';
import { GalleryPill } from '~/components/GalleryPill';
import CommunityHoverCard from '~/components/HoverCard/CommunityHoverCard';
import { MintLinkButton } from '~/components/MintLinkButton';
import { PostComposerModal } from '~/components/Posts/PostComposerModal';
import {
  CreatorProfilePictureAndUsernameOrAddress,
  OwnerProfilePictureAndUsername,
} from '~/components/ProfilePicture/ProfilePictureAndUserOrAddress';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { NftDetailTextFragment$key } from '~/generated/NftDetailTextFragment.graphql';
import { NftDetailTextQueryFragment$key } from '~/generated/NftDetailTextQueryFragment.graphql';
import useAdmireToken from '~/hooks/api/posts/useAdmireToken';
import useRemoveTokenAdmire from '~/hooks/api/posts/useRemoveTokenAdmire';
import useUniversalAuthModal from '~/hooks/useUniversalAuthModal';
import { useBreakpoint, useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import BookmarkIcon from '~/icons/BookmarkIcon';
import ExpandIcon from '~/icons/ExpandIcon';
import { PlusSquareIcon } from '~/icons/PlusSquareIcon';
import { NftAdditionalDetails } from '~/scenes/NftDetailPage/NftAdditionalDetails/NftAdditionalDetails';
import { contexts, flows } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';
import unescape from '~/shared/utils/unescape';
import { getCommunityUrlFromCommunity } from '~/utils/getCommunityUrl';
import useOptimisticUserInfo from '~/utils/useOptimisticUserInfo';

/**
 * TODO: Figure out when to support creator addresses
 */

const SHOW_BUY_NOW_BUTTON = false;

type Props = {
  tokenRef: NftDetailTextFragment$key;
  queryRef: NftDetailTextQueryFragment$key;
  authenticatedUserOwnsAsset: boolean;
  toggleLightbox?: () => void;
};

function NftDetailText({ queryRef, tokenRef, authenticatedUserOwnsAsset, toggleLightbox }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailTextFragment on Token {
        id
        dbid
        definition {
          description
          community {
            creator {
              ... on GalleryUser {
                __typename
              }
              ...ProfilePictureAndUserOrAddressCreatorFragment
            }
            ...CommunityHoverCardFragment
            ...getCommunityUrlFromCommunityFragment
          }
          contract {
            badgeURL
          }
        }
        owner {
          username
          dbid
          primaryWallet {
            chainAddress {
              address
            }
          }
          ...ProfilePictureAndUserOrAddressOwnerFragment
        }

        viewerAdmire {
          dbid
        }

        ...NftAdditionalDetailsFragment
        ...extractRelevantMetadataFromTokenFragment
        ...MintLinkButtonFragment
      }
    `,
    tokenRef
  );

  const query = useFragment(
    graphql`
      fragment NftDetailTextQueryFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            user {
              dbid
            }
          }
        }
        ...useOptimisticUserInfoFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();
  const track = useTrack();
  const info = useOptimisticUserInfo(query);

  const hasViewerAdmiredToken = Boolean(token.viewerAdmire);

  const { tokenId, name, contractName, contractAddress, chain, openseaUrl } =
    extractRelevantMetadataFromToken(token);

  const decodedTokenName = useMemo(() => {
    if (name) {
      return unescape(name);
    }

    return null;
  }, [name]);

  const ownerWalletAddress = token.owner?.primaryWallet?.chainAddress?.address ?? '';

  const [admireToken] = useAdmireToken();
  const [removeTokenAdmire] = useRemoveTokenAdmire();

  const showAuthModal = useUniversalAuthModal();

  const handleAdmire = useCallback(async () => {
    if (query.viewer?.__typename !== 'Viewer') {
      showAuthModal();
      return;
    }

    track('Admire Token Click');
    admireToken(token.id, token.dbid, info, decodedTokenName);
  }, [
    query.viewer?.__typename,
    track,
    admireToken,
    token.id,
    token.dbid,
    info,
    decodedTokenName,
    showAuthModal,
  ]);

  const handleRemoveAdmire = useCallback(async () => {
    if (
      !token.viewerAdmire?.dbid ||
      query.viewer?.__typename !== 'Viewer' ||
      !query.viewer?.user?.dbid
    ) {
      return;
    }
    removeTokenAdmire(
      token.id,
      token.dbid,
      token.viewerAdmire.dbid,
      query.viewer?.user?.dbid,
      decodedTokenName
    );
  }, [
    decodedTokenName,
    query.viewer,
    removeTokenAdmire,
    token.dbid,
    token.id,
    token.viewerAdmire?.dbid,
  ]);

  const isMobile = useIsMobileWindowWidth();

  const breakpoint = useBreakpoint();
  const horizontalLayout = breakpoint === size.desktop || breakpoint === size.tablet;

  const handleBuyNowClick = useCallback(() => {
    track('Buy Now Button Click', {
      username: token.owner?.username ? token.owner.username.toLowerCase() : undefined,
      contractAddress,
      tokenId,
      externaUrl: openseaUrl,
    });
  }, [track, token.owner?.username, contractAddress, tokenId, openseaUrl]);

  if (!token.definition.community) {
    throw new Error('Community not returned for token in NftDetailText');
  }

  const communityUrl = getCommunityUrlFromCommunity(token.definition.community);

  const navbarHeight = useGlobalNavbarHeight();

  const handleCreatePostClick = useCallback(() => {
    showModal({
      content: (
        <PostComposerModal
          tokenId={token.dbid}
          eventFlow={flows['NFT Detail Page Post Create Flow']}
        />
      ),
      headerVariant: 'thicc',
      isFullPage: isMobile,
    });
  }, [isMobile, showModal, token]);

  const OwnerAndCreatorDetails = useMemo(() => {
    // ignore if owner is welovetheart
    // TODO: rohan - remove this check after the event
    const ownerUserId = token.owner?.dbid ?? '';
    const isOwnerWelovetheart = ownerUserId === '2Z8hbOMIYm4NWfKN7SH8hqF8pRX';
    const shouldShowOwner = token.owner?.username && !isOwnerWelovetheart;

    return (
      <>
        {shouldShowOwner && (
          <VStack gap={2}>
            <TitleXS>OWNER</TitleXS>
            <OwnerProfilePictureAndUsername
              userRef={token.owner}
              eventContext={contexts['NFT Detail']}
            />
          </VStack>
        )}
        {token.definition.community?.creator && (
          <VStack gap={2}>
            <TitleXS>CREATOR</TitleXS>
            <CreatorProfilePictureAndUsernameOrAddress
              userOrAddressRef={token.definition.community.creator}
              eventContext={contexts['NFT Detail']}
            />
          </VStack>
        )}
      </>
    );
  }, [token.owner, token.definition.community?.creator]);

  const OwnerAndCreatorSection = useMemo(() => {
    const ownerUsernameLength = token.owner?.username?.length ?? 0;

    // if owner username is too long we want the owner and creator on their own row
    if (ownerUsernameLength > 15) {
      return <VStack gap={10}>{OwnerAndCreatorDetails}</VStack>;
    } else if (ownerUsernameLength !== 0) {
      return (
        <StyledOwnerAndCreator justify="space-between">
          {OwnerAndCreatorDetails}
        </StyledOwnerAndCreator>
      );
    }
    return null;
  }, [token.owner?.username, OwnerAndCreatorDetails]);

  return (
    <StyledDetailLabel horizontalLayout={horizontalLayout} navbarHeight={navbarHeight}>
      <VStack gap={isMobile ? 32 : 24}>
        <VStack gap={8}>
          <HStack gap={8} justify="space-between">
            {name && <TitleM>{decodedTokenName}</TitleM>}
            {isMobile && toggleLightbox && (
              <IconContainer
                variant="default"
                size="md"
                icon={<ExpandIcon width={16} />}
                onClick={toggleLightbox}
              />
            )}
          </HStack>
          <HStack align="center" gap={4}>
            {communityUrl && token.definition.community ? (
              <CommunityHoverCard
                communityRef={token.definition.community}
                communityName={contractName}
              >
                <GalleryPill
                  eventElementId="NFT Detail Community Pill"
                  eventName="NFT Detail Community Pill Click"
                  eventContext={contexts['NFT Detail']}
                  to={communityUrl}
                >
                  <StyledPillContent gap={4} align="center" justify="flex-end">
                    {chain === 'POAP' && <PoapLogo />}
                    {token.definition.contract?.badgeURL && (
                      <StyledBadge src={token.definition.contract.badgeURL} />
                    )}
                    <StyledContractName>{contractName}</StyledContractName>
                  </StyledPillContent>
                </GalleryPill>
              </CommunityHoverCard>
            ) : (
              <GalleryPill
                eventElementId="NFT Detail Community Pill"
                eventName="NFT Detail Community Pill Click"
                eventContext={contexts['NFT Detail']}
                disabled
              >
                <StyledContractName>{contractName}</StyledContractName>
              </GalleryPill>
            )}
          </HStack>
        </VStack>
        {OwnerAndCreatorSection}
        {token.definition.description && (
          <BaseM>
            <Markdown text={token.definition.description} eventContext={contexts['NFT Detail']} />
          </BaseM>
        )}

        <StyledButtonContainer gap={12}>
          <StyledBookmarkButton
            active={hasViewerAdmiredToken}
            onClick={hasViewerAdmiredToken ? handleRemoveAdmire : handleAdmire}
            variant="blue"
            eventElementId="Nft Detail Bookmark Token Button"
            eventName="Nft Detail Bookmark Token Button Pressed"
            eventContext={contexts['NFT Detail']}
          >
            <StyledBookmarkButtonContainer active={hasViewerAdmiredToken} gap={8} align="center">
              <BookmarkIcon isActive={hasViewerAdmiredToken} colorScheme="blue" />
              {hasViewerAdmiredToken ? 'Bookmarked' : 'Bookmark'}
            </StyledBookmarkButtonContainer>
          </StyledBookmarkButton>
          {authenticatedUserOwnsAsset ? (
            <StyledInteractionButton
              eventElementId="Create Post Button"
              eventName="Create Post"
              eventContext={contexts['NFT Detail']}
              onClick={handleCreatePostClick}
            >
              <HStack gap={8} align="center">
                <PlusSquareIcon stroke="#FFFFFF" />
                Create Post
              </HStack>
            </StyledInteractionButton>
          ) : (
            <StyledMintLinkButton
              tokenRef={token}
              referrerAddress={ownerWalletAddress}
              eventElementId="Click Mint Link Button"
              eventName="Click Mint Link"
              eventContext={contexts['NFT Detail']}
            />
          )}
        </StyledButtonContainer>

        <VStack gap={16}>
          <NftAdditionalDetails tokenRef={token} />

          {SHOW_BUY_NOW_BUTTON && (
            <VStack gap={24}>
              <HorizontalBreak />
              <StyledGalleryLink href={openseaUrl} onClick={handleBuyNowClick}>
                <StyledButton
                  eventElementId="Buy Now Button"
                  eventName="Buy Now"
                  eventContext={contexts['NFT Detail']}
                >
                  Buy Now
                </StyledButton>
              </StyledGalleryLink>
            </VStack>
          )}
        </VStack>
      </VStack>
    </StyledDetailLabel>
  );
}

const PoapLogo = styled.img.attrs({ src: '/icons/poap_logo.svg', alt: 'POAP Logo' })`
  width: 24px;
  height: 24px;
`;

const StyledBadge = styled.img`
  width: 100%;
  max-width: 24px;
  max-height: 24px;
`;

const StyledOwnerAndCreator = styled(HStack)`
  > ${VStack} {
    width: 50%;
  }
`;

const StyledButtonContainer = styled(HStack)`
  gap: 12px;
  flex-wrap: wrap;
  @media only screen and ${breakpoints.tablet} {
    flex-wrap: nowrap;
  }
`;

const StyledDetailLabel = styled.div<{ horizontalLayout: boolean; navbarHeight: number }>`
  display: block;
  width: 100%;
  padding: 0 16px;
  position: relative; // the content can be scrollable, so this ensures the taller content height doesnt affect the page height
  word-wrap: break-word;

  ${({ horizontalLayout, navbarHeight }) =>
    horizontalLayout
      ? `
    max-height: calc(100vh - ${navbarHeight * 2}px);
    overflow: auto;
    margin-right: 16px;
    `
      : `
      margin: 32px 0px;
      padding-bottom: 48px;
    `}

  @media only screen and ${breakpoints.tablet} {
    padding: 0;
    max-width: 420px;
    min-width: 420px;
    margin-top: 0;
  }
`;

const StyledBookmarkButtonContainer = styled(HStack)<{ active: boolean }>`
  ${({ active }) => (active ? `color: ${colors.hyperBlue}` : null)};
`;

const StyledGalleryLink = styled(GalleryLink)`
  text-decoration: none;
`;

const StyledBookmarkButton = styled(Button)<{ active: boolean }>`
  display: flex;
  flex-grow: 1;
  min-width: 202px;
`;

const StyledInteractionButton = styled(Button)`
  display: flex;
  flex-grow: 1;
  min-width: 202px;
`;

const StyledButton = styled(Button)`
  width: 100%;
`;

const StyledPillContent = styled(HStack)`
  width: 100%;
`;

const StyledContractName = styled(TitleDiatypeM)`
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-overflow: ellipsis;
`;

const StyledMintLinkButton = styled(MintLinkButton)`
  width: 100%;
`;

export default NftDetailText;
