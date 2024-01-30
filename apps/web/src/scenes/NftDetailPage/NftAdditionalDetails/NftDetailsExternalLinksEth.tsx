import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import IconContainer from '~/components/core/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
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
        owner {
          dbid
        }
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

  // ignore openseaUrl if owner is welovetheart
  // TODO: rohan - remove this check after the event
  const ownerUserId = token.owner?.dbid ?? '';
  const isOwnerWelovetheart = ownerUserId === '2Z8hbOMIYm4NWfKN7SH8hqF8pRX';
  const showOpenseaUrl = openseaUrl && !isOwnerWelovetheart;

  return (
    <>
      <StyledExternalLinks gap={4}>
        {mirrorUrl && (
          <GalleryLink
            href={mirrorUrl}
            eventElementId="Mirror Link"
            eventName="Mirror Link Click"
            eventContext={contexts['NFT Detail']}
          >
            <HStack gap={4}>
              <BaseM>View on</BaseM>
              <TitleDiatypeM>Mirror</TitleDiatypeM>
            </HStack>
          </GalleryLink>
        )}
        {projectUrl && (
          <GalleryLink href={projectUrl}>
            <TitleDiatypeM>Official Site</TitleDiatypeM>
          </GalleryLink>
        )}
        {prohibitionUrl && (
          <GalleryLink
            href={prohibitionUrl}
            eventElementId="Prohibition Link"
            eventName="Prohibition Link Click"
            eventContext={contexts['NFT Detail']}
          >
            <HStack gap={4}>
              <BaseM>View on</BaseM>
              <TitleDiatypeM>Prohibition</TitleDiatypeM>
            </HStack>
          </GalleryLink>
        )}
        {showOpenseaUrl && (
          <VStack gap={14}>
            <GalleryLink
              href={openseaUrl}
              eventElementId="Opensea Link"
              eventName="Opensea Link Click"
              eventContext={contexts['NFT Detail']}
            >
              <HStack gap={4}>
                <BaseM>View on</BaseM>
                <TitleDiatypeM>OpenSea</TitleDiatypeM>
              </HStack>
            </GalleryLink>
          </VStack>
        )}
      </StyledExternalLinks>
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
    </>
  );
}

const StyledExternalLinks = styled(VStack)``;
