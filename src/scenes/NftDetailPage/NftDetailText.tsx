import { BaseM, TitleM, TitleXS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

import breakpoints, { size } from 'components/core/breakpoints';
import styled from 'styled-components';
import Markdown from 'components/core/Markdown/Markdown';
import NftAdditionalDetails, { getOpenseaExternalUrl } from './NftAdditionalDetails';
import { useBreakpoint, useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { EnsOrAddress } from 'components/EnsOrAddress';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { useCallback, useMemo, useRef } from 'react';
import { DISABLED_CONTRACTS } from 'pages/community/[contractAddress]';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/GlobalNavbar/GlobalNavbar';
import HorizontalBreak from 'components/core/HorizontalBreak/HorizontalBreak';
import { Button } from 'components/core/Button/Button';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import useIsFigure31ProfilePage from 'hooks/oneOffs/useIsFigure31ProfilePage';

type Props = {
  name: string | null;
  description: string | null;
  ownerUsername: string;
  authenticatedUserOwnsAsset: boolean;
  contractAddress: string | null;
  tokenId: string | null;
  dbId: string | null;
  externalUrl: string | null;
  // TODO [GAL-206]: support Creator Address post-merge
  // creatorAddress: string | null;
  contractName: string | null;
};

function NftDetailText({
  name,
  description,
  ownerUsername,
  contractAddress,
  tokenId,
  dbId,
  externalUrl,
  authenticatedUserOwnsAsset,
  // TODO [GAL-206]: support Creator Address post-merge
  // creatorAddress,
  contractName,
}: Props) {
  const isMobile = useIsMobileWindowWidth();
  const breakpoint = useBreakpoint();
  const horizontalLayout = breakpoint === size.desktop || breakpoint === size.tablet;
  // TODO [GAL-206]: support Creator Address post-merge
  // const addressToUse = creatorAddress || contractAddress || '';
  const addressToUse = contractAddress || '';

  // useRef to prevent rendered username from briefly changing before fade transition upon route change
  const username = useRef(ownerUsername);

  const showCommunityLink = useMemo(
    () => !!contractAddress && !DISABLED_CONTRACTS.includes(contractAddress),
    [contractAddress]
  );

  const openseaExternalUrl = getOpenseaExternalUrl(contractAddress ?? '', tokenId ?? '');
  const track = useTrack();
  const handleBuyNowClick = useCallback(() => {
    track('Buy Now Button Click', {
      username: username.current.toLowerCase(),
      contractAddress,
      tokenId,
      externaUrl: openseaExternalUrl,
    });
  }, [track, contractAddress, tokenId, openseaExternalUrl]);

  const isFigure31ProfilePage = useIsFigure31ProfilePage();

  return (
    <StyledDetailLabel horizontalLayout={horizontalLayout}>
      {name && (
        <>
          <TitleM>{name}</TitleM>
          <Spacer height={4} />
        </>
      )}
      {contractName && showCommunityLink ? (
        <InteractiveLink to={`/community/${contractAddress}`}>{contractName}</InteractiveLink>
      ) : (
        <BaseM>{contractName}</BaseM>
      )}
      <Spacer height={isMobile ? 32 : 24} />
      {!isFigure31ProfilePage && description && (
        <>
          <BaseM>
            <Markdown text={description} />
          </BaseM>
          <Spacer height={isMobile ? 32 : 24} />
        </>
      )}
      <TitleXS>Owner</TitleXS>
      <InteractiveLink to={`/${username.current}`}>{username.current}</InteractiveLink>
      <Spacer height={16} />
      {addressToUse && (
        <>
          <TitleXS>Creator</TitleXS>
          <BaseM>
            {addressToUse === '0x5872c9360cb6d6a0309f3045376e2bf8e7837971' ? (
              <InteractiveLink to={`/${username.current}`}>{username.current}</InteractiveLink>
            ) : (
              <EnsOrAddress address={addressToUse} />
            )}
          </BaseM>
        </>
      )}
      <Spacer height={24} />
      <NftAdditionalDetails
        contractAddress={contractAddress}
        tokenId={tokenId}
        dbId={dbId}
        externalUrl={externalUrl}
        authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
      />
      {false && isFigure31ProfilePage && (
        <>
          <Spacer height={24} />
          <HorizontalBreak />
          <Spacer height={24} />
          <StyledInteractiveLink href={openseaExternalUrl} onClick={handleBuyNowClick}>
            <StyledButton>Buy Now</StyledButton>
          </StyledInteractiveLink>
        </>
      )}
    </StyledDetailLabel>
  );
}

const StyledDetailLabel = styled.div<{ horizontalLayout: boolean }>`
  display: block;
  max-width: 296px;
  min-width: 296px;
  word-wrap: break-word;

  ${({ horizontalLayout }) =>
    horizontalLayout
      ? `
    max-height: calc(100vh - ${GLOBAL_NAVBAR_HEIGHT * 2}px);
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

export default NftDetailText;
