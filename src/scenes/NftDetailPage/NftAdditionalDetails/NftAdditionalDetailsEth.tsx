import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useMemo } from 'react';
import { getOpenseaExternalUrl, hexHandler } from 'utils/getOpenseaExternalUrl';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import { EnsOrAddress } from 'components/EnsOrAddress';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import isFeatureEnabled from 'utils/graphql/isFeatureEnabled';
import { FeatureFlag } from 'components/core/enums';
import styled from 'styled-components';
import { NftAdditionalDetailsEthFragment$key } from '../../../../__generated__/NftAdditionalDetailsEthFragment.graphql';
import { CopyableAddress } from 'components/CopyableAddress';
import { useRefreshMetadata } from 'scenes/NftDetailPage/NftAdditionalDetails/useRefreshMetadata';
import { NftAdditionalDetailsEthQuery } from '../../../../__generated__/NftAdditionalDetailsEthQuery.graphql';

type NftAdditionaDetailsNonPOAPProps = {
  showDetails: boolean;
  tokenRef: NftAdditionalDetailsEthFragment$key;
};

export function NftAdditionalDetailsEth({ tokenRef }: NftAdditionaDetailsNonPOAPProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsEthFragment on Token {
        dbid
        externalUrl
        tokenId
        contract {
          creatorAddress {
            address
            ...CopyableAddressFragment
            ...EnsOrAddressWithSuspenseFragment
          }
          contractAddress {
            address
            ...CopyableAddressFragment
          }
        }

        ...useRefreshMetadataFragment
      }
    `,
    tokenRef
  );

  // TODO: We should thread a query ref down to this somehow
  const query = useLazyLoadQuery<NftAdditionalDetailsEthQuery>(
    graphql`
      query NftAdditionalDetailsEthQuery {
        ...isFeatureEnabledFragment
      }
    `,
    {}
  );

  const { tokenId, contract, externalUrl } = token;

  const [refresh, isRefreshing] = useRefreshMetadata(token);

  const openSeaExternalUrl = useMemo(() => {
    if (contract?.contractAddress?.address && tokenId) {
      return getOpenseaExternalUrl(contract.contractAddress.address, tokenId);
    }

    return null;
  }, [contract?.contractAddress?.address, tokenId]);

  return (
    <VStack gap={16}>
      {token.contract?.creatorAddress?.address && (
        <div>
          <TitleXS>Creator</TitleXS>
          <EnsOrAddress chainAddressRef={token.contract.creatorAddress} />
        </div>
      )}

      {contract?.contractAddress?.address && (
        <div>
          <TitleXS>Contract address</TitleXS>
          <CopyableAddress chainAddressRef={contract.contractAddress} />
        </div>
      )}

      {tokenId && (
        <div>
          <TitleXS>Token ID</TitleXS>
          <BaseM>{hexHandler(tokenId)}</BaseM>
        </div>
      )}

      <StyledLinkContainer>
        {openSeaExternalUrl && (
          <>
            <InteractiveLink href={openSeaExternalUrl}>View on OpenSea</InteractiveLink>
            {isFeatureEnabled(FeatureFlag.REFRESH_METADATA, query) && (
              <InteractiveLink onClick={refresh} disabled={isRefreshing}>
                Refresh metadata
              </InteractiveLink>
            )}
          </>
        )}
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
