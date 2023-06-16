import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { NftAdditionalDetailsTezosFragment$key } from '~/generated/NftAdditionalDetailsTezosFragment.graphql';
import { hexHandler } from '~/shared/utils/getOpenseaExternalUrl';
import { getFxHashExternalUrl, getObjktExternalUrl } from '~/shared/utils/getTezosExternalUrl';

import { InteractiveLink } from '../../components/InteractiveLink';
import { LinkableAddress } from '../../components/LinkableAddress';
import { DetailLabelText, DetailSection } from './DetailSection';

type NftAdditionaDetailsNonPOAPProps = {
  showDetails: boolean;
  tokenRef: NftAdditionalDetailsTezosFragment$key;
};

export function NftAdditionalDetailsTezos({
  tokenRef,
  showDetails,
}: NftAdditionaDetailsNonPOAPProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsTezosFragment on Token {
        externalUrl
        tokenId
        chain
        contract {
          creatorAddress {
            address
            ...LinkableAddressFragment
          }
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
    <View className="flex flex-col space-y-4">
      {token.contract?.creatorAddress?.address && (
        <DetailSection>
          <DetailLabelText>CREATED BY</DetailLabelText>

          {/* TODO(Terence) When the contract screen is ready, setup the onPress here */}
          <LinkableAddress
            chainAddressRef={token.contract.creatorAddress}
            type="NFT Detail Creator Address"
          />
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

            {tokenId && token.externalUrl && (
              <DetailSection>
                <DetailLabelText>TOKEN ID</DetailLabelText>
                <InteractiveLink href={token.externalUrl} type="NFT Detail Token ID">
                  {hexHandler(tokenId)}
                </InteractiveLink>
              </DetailSection>
            )}
          </View>

          {token.chain && (
            <DetailSection>
              <DetailLabelText>CHAIN</DetailLabelText>
              <InteractiveLink type="NFT Detail Chain">{token.chain}</InteractiveLink>
            </DetailSection>
          )}

          <View className="flex flex-row space-x-1">
            {fxhashUrl && (
              <InteractiveLink href={fxhashUrl} type="NFT Detail FX Hash URL">
                View on fx(hash)
              </InteractiveLink>
            )}
            {objktUrl && (
              <InteractiveLink href={objktUrl} type="NFT Detail OBJKT URL">
                View on objkt
              </InteractiveLink>
            )}
            {externalUrl && (
              <InteractiveLink href={externalUrl} type="NFT Detail More Info URL">
                More Info
              </InteractiveLink>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
