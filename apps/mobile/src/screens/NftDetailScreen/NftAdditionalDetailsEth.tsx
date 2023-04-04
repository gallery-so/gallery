import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftAdditionalDetailsEthFragment$key } from '~/generated/NftAdditionalDetailsEthFragment.graphql';
import { getOpenseaExternalUrl, hexHandler } from '~/shared/utils/getOpenseaExternalUrl';

import { EnsOrAddress } from '../../components/EnsOrAddress';
import { InteractiveLink } from '../../components/InteractiveLink';
import { LinkableAddress } from '../../components/LinkableAddress';
import { DetailLabelText, DetailSection, DetailValue } from './DetailSection';

type NftAdditionalDetailsEthProps = {
  showDetails: boolean;
  tokenRef: NftAdditionalDetailsEthFragment$key;
};

export function NftAdditionalDetailsEth({ tokenRef, showDetails }: NftAdditionalDetailsEthProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsEthFragment on Token {
        externalUrl
        tokenId

        chain

        owner {
          username
        }

        contract {
          creatorAddress {
            address
            ...LinkableAddressFragment
            ...EnsOrAddressWithSuspenseFragment
          }
          contractAddress {
            address
            ...LinkableAddressFragment
            ...EnsOrAddressWithSuspenseFragment
          }
        }
      }
    `,
    tokenRef
  );

  const { tokenId, contract, externalUrl } = token;

  const openSeaExternalUrl = useMemo(() => {
    if (contract?.contractAddress?.address && tokenId) {
      return getOpenseaExternalUrl(contract.contractAddress.address, tokenId);
    }

    return null;
  }, [contract?.contractAddress?.address, tokenId]);

  return (
    <View className="flex flex-col space-y-4">
      {token.owner?.username && (
        <DetailSection>
          <DetailLabelText>OWNED BY</DetailLabelText>

          {/* TODO(Terence) When the user profile screen is ready, setup the onPress here */}
          <InteractiveLink>{token.owner.username}</InteractiveLink>
        </DetailSection>
      )}

      {token.contract?.creatorAddress?.address && (
        <DetailSection>
          <DetailLabelText>CREATED BY</DetailLabelText>

          {/* TODO(Terence) When the contract screen is ready, setup the onPress here */}
          <EnsOrAddress chainAddressRef={token.contract.creatorAddress} />
        </DetailSection>
      )}

      {showDetails && (
        <View className="flex flex-col space-y-4">
          <View className="flex flex-row space-x-16">
            {contract?.contractAddress?.address && (
              <DetailSection>
                <DetailLabelText>CONTRACT ADDRESS</DetailLabelText>
                <LinkableAddress chainAddressRef={contract.contractAddress} />
              </DetailSection>
            )}

            {tokenId && (
              <DetailSection>
                <DetailLabelText>TOKEN ID</DetailLabelText>
                <DetailValue>{hexHandler(tokenId)}</DetailValue>
              </DetailSection>
            )}
          </View>

          {token.chain && (
            <DetailSection>
              <DetailLabelText>CHAIN</DetailLabelText>
              <DetailValue>{token.chain}</DetailValue>
            </DetailSection>
          )}

          {openSeaExternalUrl && (
            <DetailSection>
              <InteractiveLink href={openSeaExternalUrl}>View on OpenSea</InteractiveLink>
            </DetailSection>
          )}

          {externalUrl && (
            <DetailSection>
              <InteractiveLink href={externalUrl}>More Info</InteractiveLink>
            </DetailSection>
          )}
        </View>
      )}
    </View>
  );
}
