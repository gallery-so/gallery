import { BaseM, TitleM, TitleXS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

import breakpoints, { size } from 'components/core/breakpoints';
import styled from 'styled-components';
import Markdown from 'components/core/Markdown/Markdown';
import NftAdditionalDetails, { getOpenseaExternalUrl } from './NftAdditionalDetails';
import { useBreakpoint, useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { EnsOrAddress } from 'components/EnsOrAddress';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { useCallback, useMemo } from 'react';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/GlobalNavbar/GlobalNavbar';
import HorizontalBreak from 'components/core/HorizontalBreak/HorizontalBreak';
import { Button } from 'components/core/Button/Button';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useFragment } from 'react-relay';
import { NftDetailTextFragment$key } from '../../../__generated__/NftDetailTextFragment.graphql';
import { getCommunityUrlForToken } from 'utils/getCommunityUrlForToken';

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
        dbid
        name
        description
        tokenId
        externalUrl
        owner {
          username
        }
        contract {
          name
          chain
          contractAddress {
            address
          }
        }

        ...NftAdditionalDetailsFragment
        ...getCommunityUrlForTokenFragment
      }
    `,
    tokenRef
  );

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

  return (
    <StyledDetailLabel horizontalLayout={horizontalLayout}>
      {token.name && (
        <>
          <TitleM>{token.name}</TitleM>
          <Spacer height={4} />
        </>
      )}
      {communityUrl && token.contract?.name ? (
        <InteractiveLink to={communityUrl}>{token.contract.name}</InteractiveLink>
      ) : (
        <BaseM>{token.contract?.name}</BaseM>
      )}
      <Spacer height={isMobile ? 32 : 24} />
      {token.description && (
        <>
          <BaseM>
            <Markdown text={token.description} />
          </BaseM>
          <Spacer height={isMobile ? 32 : 24} />
        </>
      )}
      {token.owner?.username && (
        <>
          <TitleXS>Owner</TitleXS>
          <InteractiveLink to={`/${token.owner.username}`}>{token.owner.username}</InteractiveLink>
          <Spacer height={16} />
        </>
      )}
      {token.contract?.contractAddress?.address && (
        <>
          <TitleXS>Creator</TitleXS>
          <BaseM>
            <EnsOrAddress address={token.contract.contractAddress.address} />
          </BaseM>
        </>
      )}
      <Spacer height={24} />
      <NftAdditionalDetails tokenRef={token} />
      {SHOW_BUY_NOW_BUTTON && (
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
