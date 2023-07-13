import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftAdditionalDetailsEthFragment$key } from '~/generated/NftAdditionalDetailsEthFragment.graphql';
import { getOpenseaExternalUrl, hexHandler } from '~/shared/utils/getOpenseaExternalUrl';

import { LinkableAddress } from '../../components/LinkableAddress';
import {
  DetailExternalLink,
  DetailLabelText,
  DetailMoreInfoLink,
  DetailSection,
  DetailValue,
} from './DetailSection';

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
          contractAddress {
            address
            ...LinkableAddressFragment
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
      {showDetails && (
        <View className="flex flex-col space-y-4">
          <View className="flex flex-row space-x-16">
            {contract?.contractAddress?.address && (
              <DetailSection>
                <DetailLabelText>CONTRACT</DetailLabelText>
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

          <View className="flex flex-row space-x-16">
            {token.chain && (
              <DetailSection>
                <DetailLabelText>NETWORK</DetailLabelText>
                <DetailValue>{token.chain}</DetailValue>
              </DetailSection>
            )}

            {openSeaExternalUrl && (
              <DetailSection>
                <DetailExternalLink
                  link={openSeaExternalUrl}
                  label="OpenSea"
                  trackingLabel="NFT Detail View on Opensea"
                />
              </DetailSection>
            )}
          </View>

          {externalUrl && (
            <DetailSection>
              <DetailMoreInfoLink link={externalUrl} />
            </DetailSection>
          )}
        </View>
      )}
    </View>
  );
}
