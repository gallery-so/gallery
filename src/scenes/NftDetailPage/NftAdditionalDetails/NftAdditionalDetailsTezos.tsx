import { graphql, useFragment } from 'react-relay';
import { useMemo } from 'react';
import { hexHandler } from 'utils/getOpenseaExternalUrl';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import styled from 'styled-components';
import { NftAdditionalDetailsTezosFragment$key } from '../../../../__generated__/NftAdditionalDetailsTezosFragment.graphql';
import { useRefreshMetadata } from 'scenes/NftDetailPage/NftAdditionalDetails/useRefreshMetadata';
import { getFxHashExternalUrl, getObjktExternalUrl } from 'utils/getTezosExternalUrl';
import { TezosDomainOrAddress } from 'components/TezosDomainOrAddress';
import { LinkableAddress } from 'components/LinkableAddress';

type NftAdditionaDetailsNonPOAPProps = {
  showDetails: boolean;
  tokenRef: NftAdditionalDetailsTezosFragment$key;
};

export function NftAdditionalDetailsTezos({ tokenRef }: NftAdditionaDetailsNonPOAPProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsTezosFragment on Token {
        dbid
        externalUrl
        tokenId
        contract {
          creatorAddress {
            address
            ...TezosDomainOrAddressWithSuspenseFragment
          }
          contractAddress {
            address
            ...LinkableAddressFragment
          }
        }

        ...useRefreshMetadataFragment
      }
    `,
    tokenRef
  );

  const [refresh, isRefreshing] = useRefreshMetadata(token);

  const { tokenId, contract, externalUrl } = token;

  const { fxhashUrl, objktUrl } = useMemo(() => {
    if (token.contract?.contractAddress?.address && token.tokenId) {
      const contractAddress = token.contract.contractAddress.address;
      const tokenId = hexHandler(token.tokenId);
      return {
        fxhashUrl: getFxHashExternalUrl(contractAddress, tokenId),
        objktUrl: getObjktExternalUrl(contractAddress, tokenId),
      };
    }

    return {
      fxhashUrl: null,
      objktUrl: null,
    };
  }, [token.contract?.contractAddress?.address, token.tokenId]);

  return (
    <VStack gap={16}>
      {token.contract?.creatorAddress?.address && (
        <div>
          <TitleXS>Creator</TitleXS>
          <TezosDomainOrAddress chainAddressRef={token.contract.creatorAddress} />
        </div>
      )}

      {contract?.contractAddress?.address && (
        <div>
          <TitleXS>Contract address</TitleXS>
          <LinkableAddress chainAddressRef={contract.contractAddress} />
        </div>
      )}

      {tokenId && (
        <div>
          <TitleXS>Token ID</TitleXS>
          <BaseM>{hexHandler(tokenId)}</BaseM>
        </div>
      )}

      <StyledLinkContainer>
        {fxhashUrl && <InteractiveLink href={fxhashUrl}>View on FxHash</InteractiveLink>}
        {objktUrl && <InteractiveLink href={objktUrl}>View on Objkt</InteractiveLink>}
        <InteractiveLink onClick={refresh} disabled={isRefreshing}>
          Refresh metadata
        </InteractiveLink>
        {externalUrl && <InteractiveLink href={externalUrl}>More Info</InteractiveLink>}
      </StyledLinkContainer>
    </VStack>
  );
}

const StyledLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
