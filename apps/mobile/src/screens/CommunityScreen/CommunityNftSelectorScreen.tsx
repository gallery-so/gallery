import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { NftSelectorContractHeader } from '~/components/NftSelector/NftSelectorContract/NftSelectorContractHeader';
import { NftSelectorContractPickerGrid } from '~/components/NftSelector/NftSelectorContract/NftSelectorContractPickerGrid';
import { NftSelectorContractWrapper } from '~/components/NftSelector/NftSelectorContract/NftSelectorContractWrapper';
import { CommunityNftSelectorScreenQuery } from '~/generated/CommunityNftSelectorScreenQuery.graphql';
import { MainTabStackNavigatorParamList, MainTabStackNavigatorProp } from '~/navigation/types';

export function CommunityNftSelectorScreen() {
  const query = useLazyLoadQuery<CommunityNftSelectorScreenQuery>(
    graphql`
      query CommunityNftSelectorScreenQuery {
        viewer {
          ... on Viewer {
            user {
              tokens {
                __typename
                definition {
                  contract {
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

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      navigation.navigate('PostComposer', {
        tokenId,
        redirectTo: 'Community',
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

  const contractName = useMemo(
    () => nonNullableTokens[0]?.definition?.contract?.name ?? '',
    [nonNullableTokens]
  );

  return (
    <NftSelectorContractWrapper>
      <NftSelectorContractHeader title={contractName} />
      <NftSelectorContractPickerGrid
        isCreator={isCreator}
        tokenRefs={nonNullableTokens}
        onSelect={handleSelectNft}
      />
    </NftSelectorContractWrapper>
  );
}
