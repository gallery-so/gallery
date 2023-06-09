import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints, { size } from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import TextButton from '~/components/core/Button/TextButton';
import HorizontalBreak from '~/components/core/HorizontalBreak/HorizontalBreak';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM, TitleM, TitleXS } from '~/components/core/Text/Text';
import { ClickablePill, NonclickablePill } from '~/components/Pill';
import { ENABLED_CREATOR } from '~/constants/creator';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { NftDetailTextFragment$key } from '~/generated/NftDetailTextFragment.graphql';
import { useBreakpoint, useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { NftAdditionalDetails } from '~/scenes/NftDetailPage/NftAdditionalDetails/NftAdditionalDetails';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';
import { getOpenseaExternalUrl } from '~/shared/utils/getOpenseaExternalUrl';
import unescape from '~/shared/utils/unescape';
import { getCommunityUrlForToken } from '~/utils/getCommunityUrlForToken';

/**
 * TODO: Figure out when to support creator addresses
 */

const SHOW_BUY_NOW_BUTTON = false;

type Props = {
  tokenRef: NftDetailTextFragment$key;
};

function NftDetailText({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailTextFragment on Token {
        name
        chain
        description
        tokenId
        tokenMetadata
        owner {
          username
        }
        contract {
          name
          chain
          contractAddress {
            address
          }
          badgeURL
        }

        ...NftAdditionalDetailsFragment
        ...getCommunityUrlForTokenFragment
      }
    `,
    tokenRef
  );

  const [showDetails, setShowDetails] = useState(false);

  const handleToggleClick = useCallback(() => {
    setShowDetails((previous) => !previous);
  }, []);

  const track = useTrack();
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobileWindowWidth();
  const horizontalLayout = breakpoint === size.desktop || breakpoint === size.tablet;

  const openseaExternalUrl = useMemo(() => {
    if (token.contract?.contractAddress?.address && token.tokenId) {
      getOpenseaExternalUrl(token.contract.contractAddress.address, token.tokenId);
    }

    return '';
  }, [token.contract?.contractAddress?.address, token.tokenId]);

  const handleBuyNowClick = useCallback(() => {
    track('Buy Now Button Click', {
      username: token.owner?.username ? token.owner.username.toLowerCase() : undefined,
      contractAddress: token.contract?.contractAddress?.address,
      tokenId: token.tokenId,
      externaUrl: openseaExternalUrl,
    });
  }, [
    track,
    token.owner?.username,
    token.contract?.contractAddress?.address,
    token.tokenId,
    openseaExternalUrl,
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

  return (
    <StyledDetailLabel horizontalLayout={horizontalLayout} navbarHeight={navbarHeight}>
      <VStack gap={isMobile ? 32 : 24}>
        <VStack gap={8}>
          {token.name && <TitleM>{decodedTokenName}</TitleM>}
          <HStack align="center" gap={4}>
            {communityUrl && token.contract?.name ? (
              <ClickablePill to={communityUrl}>
                <StyledPillContent gap={4} align="center" justify="flex-end">
                  {token.chain === 'POAP' && <PoapLogo />}
                  {token.contract?.badgeURL && <StyledBadge src={token.contract.badgeURL} />}
                  <StyledContractName>{token.contract.name}</StyledContractName>
                </StyledPillContent>
              </ClickablePill>
            ) : (
              <NonclickablePill>
                <StyledContractName>{token.contract?.name}</StyledContractName>
              </NonclickablePill>
            )}
          </HStack>
        </VStack>

        <HStack justify="space-between">
          {ENABLED_CREATOR && (
            // TODO: Update this to use the creator's username
            <VStack>
              <TitleXS>CREATOR</TitleXS>
              <StyledInteractiveLink to={{ pathname: '/[username]', query: { username: 'riley' } }}>
                <BaseM color={colors.shadow}>riley.eth</BaseM>
              </StyledInteractiveLink>
              <StyledInteractiveLink to={{ pathname: '/[username]', query: { username: 'riley' } }}>
                <BaseM color={colors.shadow}>peterson.eth</BaseM>
              </StyledInteractiveLink>
            </VStack>
          )}
          {token.owner?.username && (
            <VStack>
              <TitleXS>OWNER</TitleXS>
              <StyledInteractiveLink
                to={{ pathname: '/[username]', query: { username: token.owner.username } }}
              >
                <BaseM color={colors.shadow}>{token.owner.username}</BaseM>
              </StyledInteractiveLink>
            </VStack>
          )}
        </HStack>

        {token.description && (
          <BaseM>
            <Markdown text={token.description} />
          </BaseM>
        )}

        {showDetails || SHOW_BUY_NOW_BUTTON ? (
          <VStack gap={16}>
            {showDetails && <NftAdditionalDetails showDetails={showDetails} tokenRef={token} />}

            {SHOW_BUY_NOW_BUTTON && (
              <VStack gap={24}>
                <HorizontalBreak />
                <StyledInteractiveLink href={openseaExternalUrl} onClick={handleBuyNowClick}>
                  <StyledButton>Buy Now</StyledButton>
                </StyledInteractiveLink>
              </VStack>
            )}
          </VStack>
        ) : null}

        {poapMoreInfoUrl || poapUrl ? (
          <VStack gap={16}>
            {poapMoreInfoUrl && <InteractiveLink href={poapMoreInfoUrl}>More Info</InteractiveLink>}
            {poapUrl && <InteractiveLink href={poapUrl}>View on POAP</InteractiveLink>}
          </VStack>
        ) : null}

        {!showDetails && <TextButton text="Show Details" onClick={handleToggleClick} />}
        {showDetails && <TextButton text="Hide Details" onClick={handleToggleClick} />}
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
  max-width: 296px;
  min-width: 296px;
  word-wrap: break-word;

  ${({ horizontalLayout, navbarHeight }) =>
    horizontalLayout
      ? `
    max-height: calc(100vh - ${navbarHeight * 2}px);
    overflow: auto;
    padding-right: 16px;
    `
      : `
      margin: 32px 0px;
    `}

  @media only screen and ${breakpoints.tablet} {
    margin-left: 72px;
    margin-top: 0;
  }
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  text-decoration: none;
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
