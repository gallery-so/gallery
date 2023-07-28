import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { NftAdditionalDetailsTezosFragment$key } from '~/generated/NftAdditionalDetailsTezosFragment.graphql';
import { hexHandler } from '~/shared/utils/getOpenseaExternalUrl';
import { getFxHashExternalUrl, getObjktExternalUrl } from '~/shared/utils/getTezosExternalUrl';

import { InteractiveLink } from '../../components/InteractiveLink';
import { LinkableAddress } from '../../components/LinkableAddress';
import {
  DetailExternalLink,
  DetailLabelText,
  DetailMoreInfoLink,
  DetailSection,
  DetailValue,
} from './DetailSection';

type NftAdditionaDetailsNonPOAPProps = {
  tokenRef: NftAdditionalDetailsTezosFragment$key;
};

export function NftAdditionalDetailsTezos({ tokenRef }: NftAdditionaDetailsNonPOAPProps) {
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
      <>
        {token.contract?.creatorAddress?.address && (
          <DetailSection>
            <DetailLabelText>CREATED BY</DetailLabelText>

            {/* TODO(Terence) When the contract screen is ready, setup the onPress here */}
            <LinkableAddress
                  textStyle={{ color: 'black' }}
              chainAddressRef={token.contract.creatorAddress}
              type="NFT Detail Creator Address"
                  font={{ family: 'ABCDiatype', weight: 'Bold' }}
            />
          </DetailSection>
        )}

        <View className="flex flex-col space-y-4">
          <View className="flex flex-row space-x-16">
            {contract?.contractAddress?.address && (
              <DetailSection>
                <DetailLabelText>CONTRACT</DetailLabelText>
                <LinkableAddress
                  textStyle={{ color: 'black' }}
                  chainAddressRef={contract.contractAddress}
                  type="NFT Detail Contract Address"
                  font={{ family: 'ABCDiatype', weight: 'Bold' }}
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

          <View className="flex flex-row">
            {token.chain && (
              <DetailSection>
                <DetailLabelText>NETWORK</DetailLabelText>
                <DetailValue>{token.chain}</DetailValue>
              </DetailSection>
            )}

            <DetailSection>
              {fxhashUrl && (
                <DetailExternalLink
                  link={fxhashUrl}
                  label="fx(hash)"
                  trackingLabel="NFT Detail FX Hash URL"
                />
              )}
              {objktUrl && (
                <DetailExternalLink
                  link={objktUrl}
                  label="objkt"
                  trackingLabel="NFT Detail OBJKT URL"
                />
              )}
            </DetailSection>
            {externalUrl && <DetailMoreInfoLink link={externalUrl} />}
          </View>
        </View>
      </>
    </View>
  );
}
