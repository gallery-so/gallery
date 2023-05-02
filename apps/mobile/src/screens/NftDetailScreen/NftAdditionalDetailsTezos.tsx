import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { NftAdditionalDetailsTezosFragment$key } from '~/generated/NftAdditionalDetailsTezosFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
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
        owner {
          username
        }
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

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handleUsernamePress = useCallback(() => {
    if (token.owner?.username) {
      navigation.push('Profile', { username: token.owner.username });
    }
  }, [navigation, token.owner?.username]);

  return (
    <View className="flex flex-col space-y-4">
      {token.owner?.username && (
        <DetailSection>
          <DetailLabelText>OWNED BY</DetailLabelText>

          <InteractiveLink onPress={handleUsernamePress}>{token.owner.username}</InteractiveLink>
        </DetailSection>
      )}

      {token.contract?.creatorAddress?.address && (
        <DetailSection>
          <DetailLabelText>CREATED BY</DetailLabelText>

          {/* TODO(Terence) When the contract screen is ready, setup the onPress here */}
          <LinkableAddress chainAddressRef={token.contract.creatorAddress} />
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

            {tokenId && token.externalUrl && (
              <DetailSection>
                <DetailLabelText>TOKEN ID</DetailLabelText>
                <InteractiveLink href={token.externalUrl}>{hexHandler(tokenId)}</InteractiveLink>
              </DetailSection>
            )}
          </View>

          {token.chain && (
            <DetailSection>
              <DetailLabelText>CHAIN</DetailLabelText>
              <InteractiveLink>{token.chain}</InteractiveLink>
            </DetailSection>
          )}

          <View className="flex flex-row space-x-1">
            {fxhashUrl && <InteractiveLink href={fxhashUrl}>View on fx(hash)</InteractiveLink>}
            {objktUrl && <InteractiveLink href={objktUrl}>View on objkt</InteractiveLink>}
            {externalUrl && <InteractiveLink href={externalUrl}>More Info</InteractiveLink>}
          </View>
        </View>
      )}
    </View>
  );
}
