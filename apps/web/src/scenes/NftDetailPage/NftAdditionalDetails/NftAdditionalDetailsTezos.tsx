import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import IconContainer from '~/components/core/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleXS } from '~/components/core/Text/Text';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import { GalleryPill } from '~/components/GalleryPill';
import { LinkableAddress } from '~/components/LinkableAddress';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { NftAdditionalDetailsTezosFragment$key } from '~/generated/NftAdditionalDetailsTezosFragment.graphql';
import { RefreshIcon } from '~/icons/RefreshIcon';
import { useRefreshMetadata } from '~/scenes/NftDetailPage/NftAdditionalDetails/useRefreshMetadata';
import { contexts } from '~/shared/analytics/constants';
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';
import { hexToDec } from '~/shared/utils/hexToDec';

type NftAdditionaDetailsNonPOAPProps = {
  tokenRef: NftAdditionalDetailsTezosFragment$key;
};

export function NftAdditionalDetailsTezos({ tokenRef }: NftAdditionaDetailsNonPOAPProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsTezosFragment on Token {
        tokenId
        lastUpdated
        community {
          contractAddress {
            ...LinkableAddressFragment
          }
        }

        ...useRefreshMetadataFragment
        ...extractRelevantMetadataFromTokenFragment
      }
    `,
    tokenRef
  );

  const [refresh, isRefreshing] = useRefreshMetadata(token);

  const { tokenId, lastUpdated, fxhashUrl, objktUrl, projectUrl } =
    extractRelevantMetadataFromToken(token);

  const { community } = token;

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'right',
    });

  return (
    <VStack gap={16}>
      {community?.contractAddress && (
        <div>
          <TitleXS>Contract address</TitleXS>
          <LinkableAddress
            chainAddressRef={community.contractAddress}
            eventContext={contexts['NFT Detail']}
          />
        </div>
      )}

      {tokenId && (
        <div>
          <TitleXS>Token ID</TitleXS>
          <BaseM>{hexToDec(tokenId)}</BaseM>
        </div>
      )}

      <StyledLinkContainer>
        {fxhashUrl && (
          <GalleryLink
            href={fxhashUrl}
            eventElementId="fxhash Link"
            eventName="fxhash Link Click"
            eventContext={contexts['NFT Detail']}
          >
            <TitleDiatypeM>View on fx(hash)</TitleDiatypeM>
          </GalleryLink>
        )}
        {objktUrl && (
          <GalleryLink
            href={objktUrl}
            eventElementId="objkt Link"
            eventName="objkt Link Click"
            eventContext={contexts['NFT Detail']}
          >
            <TitleDiatypeM>View on objkt</TitleDiatypeM>
          </GalleryLink>
        )}
        {projectUrl && (
          <GalleryLink
            href={projectUrl}
            eventElementId="External Link"
            eventName="External Link Click"
            eventContext={contexts['NFT Detail']}
          >
            <TitleDiatypeM>More Info</TitleDiatypeM>
          </GalleryLink>
        )}
      </StyledLinkContainer>
      <GalleryPill
        eventElementId="Refresh Single NFT Pill"
        eventName="Refresh Single NFT"
        eventContext={contexts['NFT Detail']}
        onClick={refresh}
        disabled={isRefreshing}
      >
        <HStack gap={6} ref={reference} {...getReferenceProps()}>
          <IconContainer size="xs" variant="default" icon={<RefreshIcon />} />
          <TitleDiatypeM>Refresh metadata</TitleDiatypeM>
        </HStack>
        <NewTooltip
          {...getFloatingProps()}
          style={{ ...floatingStyle }}
          ref={floating}
          whiteSpace="pre-line"
          text={`Last refreshed ${lastUpdated}`}
        />
      </GalleryPill>
    </VStack>
  );
}

const StyledLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
