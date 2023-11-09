import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import IconContainer from '~/components/core/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import { GalleryPill } from '~/components/GalleryPill';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { NftDetailsExternalLinksEthFragment$key } from '~/generated/NftDetailsExternalLinksEthFragment.graphql';
import { RefreshIcon } from '~/icons/RefreshIcon';
import { contexts } from '~/shared/analytics/constants';
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';

import { useRefreshMetadata } from './useRefreshMetadata';

type Props = {
  tokenRef: NftDetailsExternalLinksEthFragment$key;
};

export default function NftDetailsExternalLinksEth({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailsExternalLinksEthFragment on Token {
        ...useRefreshMetadataFragment
        ...extractRelevantMetadataFromTokenFragment
      }
    `,
    tokenRef
  );

  const { lastUpdated, openseaUrl, mirrorUrl, prohibitionUrl, projectUrl } =
    extractRelevantMetadataFromToken(token);

  const [refresh, isRefreshing] = useRefreshMetadata(token);

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'top',
    });

  return (
    <StyledExternalLinks gap={14}>
      {mirrorUrl && (
        <GalleryLink
          href={mirrorUrl}
          eventElementId="Mirror Link"
          eventName="Mirror Link Click"
          eventContext={contexts['NFT Detail']}
        >
          <TitleDiatypeM>View on Mirror</TitleDiatypeM>
        </GalleryLink>
      )}
      {prohibitionUrl && (
        <GalleryLink
          href={prohibitionUrl}
          eventElementId="Prohibition Link"
          eventName="Prohibition Link Click"
          eventContext={contexts['NFT Detail']}
        >
          <TitleDiatypeM>View on Prohibition</TitleDiatypeM>
        </GalleryLink>
      )}
      {openseaUrl && (
        <VStack gap={14}>
          <GalleryLink
            href={openseaUrl}
            eventElementId="Opensea Link"
            eventName="Opensea Link Click"
            eventContext={contexts['NFT Detail']}
          >
            <TitleDiatypeM>View on OpenSea</TitleDiatypeM>
          </GalleryLink>
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
      )}
      {projectUrl && (
        <GalleryLink href={projectUrl}>
          <TitleDiatypeM>Official Site</TitleDiatypeM>
        </GalleryLink>
      )}
    </StyledExternalLinks>
  );
}

const StyledExternalLinks = styled(VStack)``;
