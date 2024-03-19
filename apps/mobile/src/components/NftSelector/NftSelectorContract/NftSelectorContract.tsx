import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { NftSelectorContractQuery } from '~/generated/NftSelectorContractQuery.graphql';
import { MainTabStackNavigatorParamList, MainTabStackNavigatorProp } from '~/navigation/types';

import { NftSelectorContractHeader } from './NftSelectorContractHeader';
import { NftSelectorContractPickerGrid } from './NftSelectorContractPickerGrid';
import { NftSelectorContractWrapper } from './NftSelectorContractWrapper';

export function NftSelectorContract() {
  const query = useLazyLoadQuery<NftSelectorContractQuery>(
    graphql`
      query NftSelectorContractQuery {
        viewer {
          ... on Viewer {
            user {
              tokens {
                __typename
                definition {
                  contract {
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

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      navigation.navigate('PostComposer', {
        tokenId,
      });
    },
    [navigation]
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

  return (
    <NftSelectorContractWrapper isFullscreen>
      <NftSelectorContractHeader title="NFTs" />
      <NftSelectorContractPickerGrid
        isCreator={isCreator}
        tokenRefs={nonNullableTokens}
        onSelect={handleSelectNft}
      />
    </NftSelectorContractWrapper>
  );
}
