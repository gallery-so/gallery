import { format, parse } from 'date-fns';
import { BaseM, TitleM, TitleXS } from 'components/core/Text/Text';

import breakpoints, { size } from 'components/core/breakpoints';
import styled from 'styled-components';
import Markdown from 'components/core/Markdown/Markdown';
import { useBreakpoint, useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { EnsOrAddress } from 'components/EnsOrAddress';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { useCallback, useMemo, useState } from 'react';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/GlobalNavbar/GlobalNavbar';
import HorizontalBreak from 'components/core/HorizontalBreak/HorizontalBreak';
import { Button } from 'components/core/Button/Button';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useFragment } from 'react-relay';
import { NftDetailTextFragment$key } from '../../../__generated__/NftDetailTextFragment.graphql';
import { getCommunityUrlForToken } from 'utils/getCommunityUrlForToken';
import { NftDetailTextPOAPSectionFragment$key } from '../../../__generated__/NftDetailTextPOAPSectionFragment.graphql';
import { NftAdditionalDetails } from 'scenes/NftDetailPage/NftAdditionalDetails/NftAdditionalDetails';
import { getOpenseaExternalUrl } from 'utils/getOpenseaExternalUrl';
import { VStack } from 'components/core/Stack/VStack';
import { NftDetailTextNonPOAPSectionFragment$key } from '../../../__generated__/NftDetailTextNonPOAPSectionFragment.graphql';
import TextButton from 'components/core/Button/TextButton';
import { HStack } from 'components/core/Stack/HStack';

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
        chain
        description
        tokenId
        tokenMetadata
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

        ...NftDetailTextNonPOAPSectionFragment
        ...NftDetailTextPOAPSectionFragment
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

  const metadata = JSON.parse(token.tokenMetadata ?? '{}');
  const poapUrl = token.chain === 'POAP' ? metadata.event_url : null;

  return (
    <StyledDetailLabel horizontalLayout={horizontalLayout}>
      <VStack gap={isMobile ? 32 : 24}>
        <VStack gap={4}>
          {token.name && <TitleM>{token.name}</TitleM>}
          <HStack alignItems="center" gap={4}>
            {token.chain === 'POAP' && <PoapLogo />}

            {communityUrl && token.contract?.name ? (
              <InteractiveLink to={communityUrl}>{token.contract.name}</InteractiveLink>
            ) : (
              <BaseM>{token.contract?.name}</BaseM>
            )}
          </HStack>
        </VStack>

        {token.description && (
          <BaseM>
            <Markdown text={token.description} />
          </BaseM>
        )}

        <VStack gap={16}>
          {token.owner?.username && (
            <div>
              <TitleXS>Owner</TitleXS>
              <InteractiveLink to={`/${token.owner.username}`}>
                {token.owner.username}
              </InteractiveLink>
            </div>
          )}

          {token.chain === 'POAP' ? (
            <POAPNftDetailSection tokenRef={token} />
          ) : (
            <NonPOAPNftDetailSection tokenRef={token} />
          )}

          {showDetails && <NftAdditionalDetails tokenRef={token} />}

          {SHOW_BUY_NOW_BUTTON && (
            <VStack gap={24}>
              <HorizontalBreak />
              <StyledInteractiveLink href={openseaExternalUrl} onClick={handleBuyNowClick}>
                <StyledButton>Buy Now</StyledButton>
              </StyledInteractiveLink>
            </VStack>
          )}
        </VStack>

        <VStack gap={16}>
          {poapUrl && <InteractiveLink href={poapUrl}>View on POAP</InteractiveLink>}

          {!showDetails && <TextButton text="Show Details" onClick={handleToggleClick} />}
          {showDetails && <TextButton text="Hide Details" onClick={handleToggleClick} />}
        </VStack>
      </VStack>
    </StyledDetailLabel>
  );
}

const PoapLogo = styled.img.attrs({ src: '/icons/poap_logo.svg', alt: 'POAP Logo' })`
  width: 16px;
  height: 16px;
`;

type EthNftDetailSectionProps = {
  tokenRef: NftDetailTextNonPOAPSectionFragment$key;
};
function NonPOAPNftDetailSection({ tokenRef }: EthNftDetailSectionProps) {
  const token = useFragment(
    graphql`
      fragment NftDetailTextNonPOAPSectionFragment on Token {
        contract {
          contractAddress {
            address
          }
        }
      }
    `,
    tokenRef
  );

  if (token.contract?.contractAddress?.address) {
    return (
      <div>
        <TitleXS>Creator</TitleXS>
        <BaseM>
          <EnsOrAddress address={token.contract.contractAddress.address} />
        </BaseM>
      </div>
    );
  }

  return null;
}

type POAPNftDetailSectionProps = {
  tokenRef: NftDetailTextPOAPSectionFragment$key;
};

function POAPNftDetailSection({ tokenRef }: POAPNftDetailSectionProps) {
  const token = useFragment(
    graphql`
      fragment NftDetailTextPOAPSectionFragment on Token {
        tokenMetadata
      }
    `,
    tokenRef
  );

  if (!token.tokenMetadata) {
    return null;
  }

  const metadata = JSON.parse(token.tokenMetadata);

  const location =
    metadata.city && metadata.country ? `${metadata.city}, ${metadata.country}` : null;

  const parsedDate = metadata.created
    ? parse(metadata.created, 'yyyy-MM-dd HH:mm:ss', new Date())
    : null;

  const formattedDate = parsedDate ? format(parsedDate, 'MMMM do, yyyy') : null;

  return (
    <VStack gap={16}>
      {formattedDate && (
        <div>
          <TitleXS>Created</TitleXS>
          <BaseM>{formattedDate}</BaseM>
        </div>
      )}
      {location && (
        <div>
          <TitleXS>Location</TitleXS>
          <BaseM>{location}</BaseM>
        </div>
      )}
    </VStack>
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
