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
import { PostComposerModal } from '~/components/Posts/PostComposerModal';
import {
  CreatorProfilePictureAndUsernameOrAddress,
  OwnerProfilePictureAndUsername,
} from '~/components/ProfilePicture/ProfilePictureAndUserOrAddress';
import { ProfilePictureStack } from '~/components/ProfilePicture/ProfilePictureStack';
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
        owner {
          username
          ...ProfilePictureAndUserOrAddressOwnerFragment
        }
        contract {
          name
          chain
          contractAddress {
            address
          }
          badgeURL
        }
        community {
          creator {
            ... on GalleryUser {
              __typename
            }
            ...ProfilePictureAndUserOrAddressCreatorFragment
          }
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

  const communityUrl = getCommunityUrlForToken(token);

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

  const OwnerAndCreatorDetails = useMemo(() => {
    return (
      <>
        {token.owner?.username && (
          <VStack gap={2}>
            <TitleXS>OWNER</TitleXS>
            <OwnerProfilePictureAndUsername
              userRef={token.owner}
              eventContext={contexts['NFT Detail']}
            />
          </VStack>
        )}
        {token.community?.creator && (
          <VStack gap={2}>
            <TitleXS>CREATOR</TitleXS>
            <CreatorProfilePictureAndUsernameOrAddress
              userOrAddressRef={token.community.creator}
              eventContext={contexts['NFT Detail']}
            />
          </VStack>
        )}
      </>
    );
  }, [token.owner, token.community?.creator]);

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
            {token.name && <TitleM>{decodedTokenName}</TitleM>}
            <HStack gap={8} align="flex-start">
              <ProfilePictureStack
                onClick={openAdmireModal}
                usersRef={nonNullAdmires}
                total={totalAdmires}
              />
              <IconContainer
                size="sm"
                variant="default"
                icon={
                  <AdmireIcon
                    active={hasViewerAdmiredToken}
                    onClick={hasViewerAdmiredToken ? handleRemoveAdmire : handleAdmire}
                  />
                }
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
        {OwnerAndCreatorSection}
        {token.description && (
          <BaseM>
            <Markdown text={token.description} eventContext={contexts['NFT Detail']} />
          </BaseM>
        )}

        <StyledButtonContainer gap={12}>
          <StyledAdmireButton
            active={hasViewerAdmiredToken}
            onClick={hasViewerAdmiredToken ? handleRemoveAdmire : handleAdmire}
            variant="blue"
            eventElementId="Nft Detail Admire Token Button"
            eventName="Nft Detail Admire Token Button Pressed"
            eventContext={contexts['NFT Detail']}
          >
            <StyledAdmireButtonContainer active={hasViewerAdmiredToken} gap={8} align="center">
              <AdmireIcon active={hasViewerAdmiredToken} />
              {hasViewerAdmiredToken ? 'Admired' : 'Admire'}
            </StyledAdmireButtonContainer>
          </StyledAdmireButton>
          {authenticatedUserOwnsAsset && (
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
`;

const StyledDetailLabel = styled.div<{ horizontalLayout: boolean; navbarHeight: number }>`
  display: block;
  max-width: 296px;
  min-width: 296px;
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
    max-width: 420px;
    min-width: 420px;
    margin-left: 56px;
    margin-top: 0;
  }
`;

const StyledAdmireButtonContainer = styled(HStack)<{ active: boolean }>`
  ${({ active }) => (active ? `color: ${colors.hyperBlue}` : null)};
`;

const StyledGalleryLink = styled(GalleryLink)`
  text-decoration: none;
`;

const StyledAdmireButton = styled(Button)<{ active: boolean }>`
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

export default NftDetailText;
