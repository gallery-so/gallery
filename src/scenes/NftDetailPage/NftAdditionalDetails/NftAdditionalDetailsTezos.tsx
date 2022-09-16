import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useMemo } from 'react';
import { hexHandler } from 'utils/getOpenseaExternalUrl';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import isFeatureEnabled from 'utils/graphql/isFeatureEnabled';
import { FeatureFlag } from 'components/core/enums';
import styled from 'styled-components';
import { NftAdditionalDetailsTezosFragment$key } from '../../../../__generated__/NftAdditionalDetailsTezosFragment.graphql';
import { CopyableAddress } from 'components/CopyableAddress';
import { NftAdditionalDetailsTezosQuery } from '../../../../__generated__/NftAdditionalDetailsTezosQuery.graphql';
import { useRefreshMetadata } from 'scenes/NftDetailPage/NftAdditionalDetails/useRefreshMetadata';
import { getObjktExternalUrl } from 'utils/getObjktExternalUrl';
import { graphqlTruncateAddress } from 'utils/wallet';
import { TezosDomainOrAddress } from 'components/TezosDomainOrAddress';

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
            ...walletTruncateAddressFragment
          }
        }

        ...useRefreshMetadataFragment
      }
    `,
    tokenRef
  );

  // TODO: We should thread a query ref down to this somehow
  const query = useLazyLoadQuery<NftAdditionalDetailsTezosQuery>(
    graphql`
      query NftAdditionalDetailsTezosQuery {
        ...isFeatureEnabledFragment
      }
    `,
    {}
  );

  const [refresh, isRefreshing] = useRefreshMetadata(token);

  const { tokenId, contract, externalUrl } = token;

  const objktExternalUrl = useMemo(() => {
    if (token.contract?.contractAddress?.address && token.tokenId) {
      return getObjktExternalUrl(token.contract.contractAddress.address, hexHandler(token.tokenId));
    }

    return null;
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
          <InteractiveLink href={`https://tzkt.io/${contract.contractAddress.address}/operations`}>
            {graphqlTruncateAddress(contract.contractAddress)}
          </InteractiveLink>
        </div>
      )}

      {tokenId && (
        <div>
          <TitleXS>Token ID</TitleXS>
          <BaseM>{hexHandler(tokenId)}</BaseM>
        </div>
      )}

      <StyledLinkContainer>
        {objktExternalUrl && (
          <>
            <InteractiveLink href={objktExternalUrl}>View on Objkt</InteractiveLink>
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
