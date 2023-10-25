import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints, { size } from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import TextButton from '~/components/core/Button/TextButton';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import HorizontalBreak from '~/components/core/HorizontalBreak/HorizontalBreak';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM, TitleM, TitleXS } from '~/components/core/Text/Text';
import { GalleryPill } from '~/components/GalleryPill';
import CommunityHoverCard from '~/components/HoverCard/CommunityHoverCard';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { PostComposerModal } from '~/components/Posts/PostComposerModal';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { ProfilePictureStack } from '~/components/ProfilePicture/ProfilePictureStack';
import { ENABLED_CREATOR } from '~/constants/creator';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { NftDetailTextFragment$key } from '~/generated/NftDetailTextFragment.graphql';
import { NftDetailTextQueryFragment$key } from '~/generated/NftDetailTextQueryFragment.graphql';
import useAdmireToken from '~/hooks/api/posts/useAdmireToken';
import useRemoveTokenAdmire from '~/hooks/api/posts/useRemoveTokenAdmire';
import { AuthModal } from '~/hooks/useAuthModal';
import { useBreakpoint, useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { PlusSquareIcon } from '~/icons/PlusSquareIcon';
import { AdmireIcon } from '~/icons/SocializeIcons';
import { NftAdditionalDetails } from '~/scenes/NftDetailPage/NftAdditionalDetails/NftAdditionalDetails';
import { contexts, flows } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';
import unescape from '~/shared/utils/unescape';
import { getCommunityUrlForToken } from '~/utils/getCommunityUrlForToken';
import useOptimisticUserInfo from '~/utils/useOptimisticUserInfo';

import { AdmireTokenModal } from './AdmireTokenModal';

/**
 * TODO: Figure out when to support creator addresses
 */

const SHOW_BUY_NOW_BUTTON = false;

type Props = {
  tokenRef: NftDetailTextFragment$key;
  queryRef: NftDetailTextQueryFragment$key;
  authenticatedUserOwnsAsset: boolean;
};

function NftDetailText({ queryRef, tokenRef, authenticatedUserOwnsAsset }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailTextFragment on Token {
        id
        dbid
        name
        chain
        description
        tokenId
        tokenMetadata
        owner {
          username
          ...ProfilePictureFragment
          ...UserHoverCardFragment
        }
        ownerIsCreator
        contract {
          name
          chain
          contractAddress {
            address
          }
          badgeURL
        }
        community {
          ...CommunityHoverCardFragment
        }
        viewerAdmire {
          dbid
        }

        previewAdmires: admires(last: 5) @connection(key: "Interactions_previewAdmires") {
          pageInfo {
            total
          }
          edges {
            node {
              __typename
              admirer {
                dbid
                username
                ...ProfilePictureStackFragment
              }
            }
          }
        }

        ...NftAdditionalDetailsFragment
        ...getCommunityUrlForTokenFragment
        ...extractRelevantMetadataFromTokenFragment
        ...AdmireTokenModalFragment
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
          }
        }
        ...useOptimisticUserInfoFragment
        ...useAuthModalFragment
        ...AdmireTokenModalQueryFragment
      }
    `,
    queryRef
  );

  const [showDetails, setShowDetails] = useState(false);
  const [isAdmireHovered, setIsAdmireHovered] = useState(false);
  const { showModal } = useModalActions();
  const track = useTrack();
  const info = useOptimisticUserInfo(query);

  const hasViewerAdmiredToken = Boolean(token.viewerAdmire);
  const totalAdmires = token?.previewAdmires?.pageInfo?.total ?? 0;
  const nonNullAdmires = useMemo(() => {
    const admires = [];

    for (const edge of token.previewAdmires?.edges ?? []) {
      if (edge?.node) {
        admires.push(edge.node.admirer);
      }
    }

    admires.reverse();

    return removeNullValues(admires);
  }, [token.previewAdmires?.edges]);

  const [admireToken] = useAdmireToken();
  const [removeTokenAdmire] = useRemoveTokenAdmire();

  const handleAdmire = useCallback(async () => {
    if (query.viewer?.__typename !== 'Viewer') {
      showModal({
        content: <AuthModal queryRef={query} />,
        headerText: 'Sign In',
      });

      return;
    }

    track('Admire Token Click');
    admireToken(token.id, token.dbid, info);
  }, [query, showModal, track, admireToken, info, token.dbid, token.id]);

  const handleRemoveAdmire = useCallback(async () => {
    if (!token.viewerAdmire?.dbid) {
      return;
    }
    removeTokenAdmire(token.id, token.dbid, token.viewerAdmire.dbid);
  }, [removeTokenAdmire, token.dbid, token.id, token.viewerAdmire?.dbid]);

  const isMobile = useIsMobileWindowWidth();

  const openAdmireModal = () =>
    showModal({
      content: <AdmireTokenModal queryRef={query} tokenRef={token} fullscreen={isMobile} />,
      isFullPage: isMobile,
      isPaddingDisabled: true,
      headerVariant: 'standard',
    });

  const handleToggleClick = useCallback(() => {
    setShowDetails((previous) => !previous);
  }, []);

  const breakpoint = useBreakpoint();
  const horizontalLayout = breakpoint === size.desktop || breakpoint === size.tablet;

  const { openseaUrl, contractName } = extractRelevantMetadataFromToken(token);

  const handleBuyNowClick = useCallback(() => {
    track('Buy Now Button Click', {
      username: token.owner?.username ? token.owner.username.toLowerCase() : undefined,
      contractAddress: token.contract?.contractAddress?.address,
      tokenId: token.tokenId,
      externaUrl: openseaUrl,
    });
  }, [
    track,
    token.owner?.username,
    token.contract?.contractAddress?.address,
    token.tokenId,
    openseaUrl,
  ]);

  const handleCreatorNameClick = useCallback(() => {
    // TODO: Update this to track the creator name click
    track('NFT Detail Creator Name Click', {
      username: token.owner?.username ? token.owner.username.toLowerCase() : undefined,
      contractAddress: token.contract?.contractAddress?.address,
      tokenId: token.tokenId,
      externaUrl: openseaUrl,
    });
  }, [
    track,
    token.owner?.username,
    token.contract?.contractAddress?.address,
    token.tokenId,
    openseaUrl,
  ]);

  const communityUrl = getCommunityUrlForToken(token);

  const metadata = JSON.parse(token.tokenMetadata ?? '{}') ?? {};
  const poapMoreInfoUrl = token.chain === 'POAP' ? metadata.event_url : null;
  const poapUrl = metadata.event_id ? `https://poap.gallery/event/${metadata.event_id}` : null;

  const navbarHeight = useGlobalNavbarHeight();
  const decodedTokenName = useMemo(() => {
    if (token.name) {
      return unescape(token.name);
    }

    return null;
  }, [token.name]);

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

  return (
    <StyledDetailLabel horizontalLayout={horizontalLayout} navbarHeight={navbarHeight}>
      <VStack gap={isMobile ? 32 : 24}>
        <VStack gap={8}>
          <HStack justify="space-between">
            {token.name && <TitleM>{decodedTokenName}</TitleM>}
            <HStack gap={8}>
              <ProfilePictureStack
                onClick={openAdmireModal}
                usersRef={nonNullAdmires}
                total={totalAdmires}
              />
              <AdmireIcon
                active={hasViewerAdmiredToken}
                onClick={hasViewerAdmiredToken ? handleRemoveAdmire : handleAdmire}
              />
            </HStack>
          </HStack>
          <HStack align="center" gap={4}>
            {communityUrl && token.community ? (
              <CommunityHoverCard communityRef={token.community} communityName={contractName}>
                <GalleryPill
                  eventElementId="NFT Detail Community Pill"
                  eventName="NFT Detail Community Pill Click"
                  eventContext={contexts['NFT Detail']}
                  to={communityUrl}
                >
                  <StyledPillContent gap={4} align="center" justify="flex-end">
                    {token.chain === 'POAP' && <PoapLogo />}
                    {token.contract?.badgeURL && <StyledBadge src={token.contract.badgeURL} />}
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

        <HStack justify="space-between">
          {token.owner?.username && (
            <UserHoverCard userRef={token.owner}>
              <VStack gap={2}>
                <TitleXS>{token.ownerIsCreator ? 'CREATOR' : 'OWNER'}</TitleXS>
                <HStack align="center" gap={4}>
                  <ProfilePicture size="sm" userRef={token.owner} />
                  <TitleDiatypeM>{token.owner.username}</TitleDiatypeM>
                </HStack>
              </VStack>
            </UserHoverCard>
          )}
          {ENABLED_CREATOR && (
            // TODO: Update this to use the creator's username
            <VStack gap={2}>
              <TitleXS>CREATOR</TitleXS>
              <GalleryLink
                onClick={handleCreatorNameClick}
                to={{ pathname: '/[username]', query: { username: 'riley' } }}
              >
                <BaseM color={colors.shadow}>riley.eth</BaseM>
              </GalleryLink>
              <GalleryLink
                onClick={handleCreatorNameClick}
                to={{ pathname: '/[username]', query: { username: 'riley' } }}
              >
                <BaseM color={colors.shadow}>peterson.eth</BaseM>
              </GalleryLink>
            </VStack>
          )}
        </HStack>

        {token.description && (
          <BaseM>
            <Markdown text={token.description} eventContext={contexts['NFT Detail']} />
          </BaseM>
        )}

        {showDetails || SHOW_BUY_NOW_BUTTON ? (
          <VStack gap={16}>
            {showDetails && <NftAdditionalDetails tokenRef={token} />}

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
        ) : null}
        <HStack gap={12}>
          <StyledAdmireButton
            active={hasViewerAdmiredToken}
            onClick={hasViewerAdmiredToken ? handleRemoveAdmire : handleAdmire}
            variant="blue"
            onMouseEnter={() => setIsAdmireHovered(true)}
            onMouseLeave={() => setIsAdmireHovered(false)}
          >
            <HStack gap={8} align="center">
              <AdmireIcon
                active={
                  (!hasViewerAdmiredToken && isAdmireHovered) ||
                  (hasViewerAdmiredToken && !isAdmireHovered)
                }
              />
              Admire
            </HStack>
          </StyledAdmireButton>
          {authenticatedUserOwnsAsset && (
            <StyledInteractionButton
              eventElementId="Create Post Button"
              eventName="Create Post"
              eventContext={contexts['NFT Detail']}
              onClick={handleCreatePostClick}>
              <HStack gap={8} align="center">
                <PlusSquareIcon stroke="#FFFFFF" />
                Create Post
              </HStack>
            </StyledInteractionButton>
          )}
        </HStack>

        {poapMoreInfoUrl || poapUrl ? (
          <VStack gap={16}>
            {poapMoreInfoUrl && <GalleryLink href={poapMoreInfoUrl}>More Info</GalleryLink>}
            {poapUrl && <GalleryLink href={poapUrl}>View on POAP</GalleryLink>}
          </VStack>
        ) : null}

        {!showDetails && (
          <TextButton
            eventElementId="Show Details Button"
            eventName="Show Details"
            eventContext={contexts['NFT Detail']}
            text="Show Details"
            onClick={handleToggleClick}
          />
        )}
        {showDetails && (
          <TextButton
            eventElementId="Hide Details Button"
            eventName="Hide Details"
            eventContext={contexts['NFT Detail']}
            text="Hide Details"
            onClick={handleToggleClick}
          />
        )}
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

const StyledDetailLabel = styled.div<{ horizontalLayout: boolean; navbarHeight: number }>`
  display: block;
  max-width: 420px;
  min-width: 420px;
  word-wrap: break-word;

  ${({ horizontalLayout, navbarHeight }) =>
    horizontalLayout
      ? `
    max-height: calc(100vh - ${navbarHeight * 2}px);
    overflow: auto;
    `
      : `
      margin: 32px 0px;
    `}

  @media only screen and ${breakpoints.tablet} {
    margin-left: 56px;
    margin-top: 0;
  }
`;

const StyledGalleryLink = styled(GalleryLink)`
  text-decoration: none;
`;

const StyledAdmireButton = styled(Button)<{ active: boolean }>`
  display: flex;
  flex-grow: 1;
  min-width: 202px;
  border: ${({ active }) => (active ? `1px solid ${colors.hyperBlue}` : 'none')};
`;

const StyledInteractionButton = styled(Button)`
  display: flex;
  flex-grow: 1;
  min-width: 202px;
`;

const StyledButton = styled(Button)`
  widht: 100%;
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

export default NftDetailText;
