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

  const { tokenId, contract, externalUrl, chain } = token;

  const openSeaExternalUrl = useMemo(() => {
    if (contract?.contractAddress?.address && tokenId && chain) {
      return getOpenseaExternalUrl(chain, contract.contractAddress.address, tokenId);
    }

    return null;
  }, [contract?.contractAddress?.address, tokenId, chain]);

  return (
    <View className="flex flex-col space-y-4">
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
                <LinkableAddress
                  chainAddressRef={contract.contractAddress}
                  type="NFT Detail Contract Address"
                />
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
              <InteractiveLink href={openSeaExternalUrl} type="NFT Detail View on Opensea">
                View on OpenSea
              </InteractiveLink>
            </DetailSection>
          )}

          {externalUrl && (
            <DetailSection>
              <InteractiveLink href={externalUrl} type="NFT Detail More Info URL">
                More Info
              </InteractiveLink>
            </DetailSection>
          )}
        </View>
      )}
    </View>
  );
}
