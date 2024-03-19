import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { NftSelectorContractHeader } from '~/components/NftSelector/NftSelectorContract/NftSelectorContractHeader';
import { NftSelectorContractPickerGrid } from '~/components/NftSelector/NftSelectorContract/NftSelectorContractPickerGrid';
import { NftSelectorContractWrapper } from '~/components/NftSelector/NftSelectorContract/NftSelectorContractWrapper';
import { OnboardingNftSelectorContractScreenQuery } from '~/generated/OnboardingNftSelectorContractScreenQuery.graphql';
import { MainTabStackNavigatorParamList, MainTabStackNavigatorProp } from '~/navigation/types';

import { useProfilePicture } from '../NftSelectorScreen/useProfilePicture';

export function OnboardingNftSelectorContractScreen() {
  const query = useLazyLoadQuery<OnboardingNftSelectorContractScreenQuery>(
    graphql`
      query OnboardingNftSelectorContractScreenQuery {
        viewer {
          ... on Viewer {
            user {
              tokens {
                __typename
                definition {
                  contract {
                    dbid
                    name
                    contractAddress {
                      address
                    }
                  }
                }
                ...NftSelectorContractPickerGridFragment
              }
            }
          }
        }
      }
    `,
    {}
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftSelectorContractScreen'>>();
  const contractAddress = route.params.contractAddress;
  const isCreator = route.params.ownerFilter === 'Created';
  const { setProfileImage } = useProfilePicture();

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      setProfileImage(tokenId).then(() => {
        // pops to go back to the profile screen
        navigation.pop(2);
      });
    },
    [navigation, setProfileImage]
  );

  const nonNullableTokens = useMemo(() => {
    const tokens = [];

    for (const token of query.viewer?.user?.tokens ?? []) {
      if (token?.definition?.contract?.contractAddress?.address === contractAddress) {
        tokens.push(token);
      }
    }

    return tokens;
  }, [query.viewer?.user?.tokens, contractAddress]);

  const contractName = nonNullableTokens[0]?.definition?.contract?.name ?? '';
  const contractId = nonNullableTokens[0]?.definition?.contract?.dbid ?? '';
  return (
    <NftSelectorContractWrapper isFullscreen>
      <NftSelectorContractHeader
        title={contractName}
        isCreator={isCreator}
        contractId={contractId}
      />
      <NftSelectorContractPickerGrid
        isCreator={isCreator}
        tokenRefs={nonNullableTokens}
        onSelect={handleSelectNft}
      />
    </NftSelectorContractWrapper>
  );
}
