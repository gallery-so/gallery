import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { VStack } from '~/components/core/Spacer/Stack';
import { NftDetailsExternalLinksEthFragment$key } from '~/generated/NftDetailsExternalLinksEthFragment.graphql';
import { extractMirrorXyzUrl } from '~/shared/utils/extractMirrorXyzUrl';
import { getOpenseaExternalUrl, hexHandler } from '~/shared/utils/getOpenseaExternalUrl';

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

  const { tokenId, contract, externalUrl, tokenMetadata, chain } = token;

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

  return (
    <StyledExternalLinks gap={4}>
      {mirrorXyzUrl && <InteractiveLink href={mirrorXyzUrl}>View on Mirror</InteractiveLink>}
      {prohibitionUrl && (
        <InteractiveLink href={prohibitionUrl}>View on Prohibition</InteractiveLink>
      )}
      {openSeaExternalUrl && (
        <>
          <InteractiveLink href={openSeaExternalUrl}>View on OpenSea</InteractiveLink>
          <InteractiveLink onClick={refresh} disabled={isRefreshing}>
            Refresh metadata
          </InteractiveLink>
        </>
      )}
      {externalUrl && <InteractiveLink href={externalUrl}>More Info</InteractiveLink>}
    </StyledExternalLinks>
  );
}

const StyledExternalLinks = styled(VStack)``;
