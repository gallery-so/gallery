import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import { ButtonPill } from '~/components/Pill';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { NftDetailsExternalLinksEthFragment$key } from '~/generated/NftDetailsExternalLinksEthFragment.graphql';
import { RefreshIcon } from '~/icons/RefreshIcon';
import { extractMirrorXyzUrl } from '~/shared/utils/extractMirrorXyzUrl';
import { getOpenseaExternalUrl, hexHandler } from '~/shared/utils/getOpenseaExternalUrl';
import { DateFormatOption, formatDateString } from '~/utils/formatDateString';

import { useRefreshMetadata } from './useRefreshMetadata';

type Props = {
  tokenRef: NftDetailsExternalLinksEthFragment$key;
};

const PROHIBITION_CONTRACT_ADDRESSES = ['0x47a91457a3a1f700097199fd63c039c4784384ab'];

export default function NftDetailsExternalLinksEth({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailsExternalLinksEthFragment on Token {
        externalUrl
        tokenId
        tokenMetadata
        chain
        lastUpdated
        contract {
          contractAddress {
            address
          }
        }
        ...useRefreshMetadataFragment
      }
    `,
    tokenRef
  );

  const {
    tokenId,
    contract,
    externalUrl,
    tokenMetadata,
    chain,
    lastUpdated: lastUpdatedRaw,
  } = token;

  const [refresh, isRefreshing] = useRefreshMetadata(token);

  const openSeaExternalUrl = useMemo(() => {
    if (chain && contract?.contractAddress?.address && tokenId) {
      return getOpenseaExternalUrl(chain, contract.contractAddress.address, tokenId);
    }

    return null;
  }, [chain, contract?.contractAddress?.address, tokenId]);

  const mirrorXyzUrl = useMemo(() => {
    if (tokenMetadata) {
      return extractMirrorXyzUrl(tokenMetadata);
    }

    return null;
  }, [tokenMetadata]);

  const prohibitionUrl = useMemo(() => {
    if (!contract?.contractAddress?.address || !tokenId) {
      return null;
    }
    if (PROHIBITION_CONTRACT_ADDRESSES.includes(contract?.contractAddress?.address)) {
      return `https://prohibition.art/token/${contract?.contractAddress?.address}-${hexHandler(
        tokenId
      )}`;
    }
    return null;
  }, [contract?.contractAddress?.address, tokenId]);
  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'top',
    });

  const lastUpdated = formatDateString(lastUpdatedRaw, DateFormatOption.ABBREVIATED);

  return (
    <StyledExternalLinks gap={14}>
      {mirrorXyzUrl && <InteractiveLink href={mirrorXyzUrl}>View on Mirror</InteractiveLink>}
      {prohibitionUrl && (
        <InteractiveLink href={prohibitionUrl}>View on Prohibition</InteractiveLink>
      )}
      {openSeaExternalUrl && (
        <VStack gap={14}>
          <InteractiveLink href={openSeaExternalUrl}>View on OpenSea</InteractiveLink>
          <StartAlignedButtonPill
            onClick={refresh}
            disabled={isRefreshing}
            ref={reference}
            {...getReferenceProps()}
          >
            <HStack gap={6}>
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
          </StartAlignedButtonPill>
        </VStack>
      )}
      {externalUrl && <InteractiveLink href={externalUrl}>More Info</InteractiveLink>}
    </StyledExternalLinks>
  );
}

const StyledExternalLinks = styled(VStack)``;

const StartAlignedButtonPill = styled(ButtonPill)`
  align-self: start;
`;
