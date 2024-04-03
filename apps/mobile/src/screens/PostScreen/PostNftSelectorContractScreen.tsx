import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { NftSelectorContract } from '~/components/NftSelector/NftSelectorContract/NftSelectorContract';
import { PostNftSelectorContractScreenQuery } from '~/generated/PostNftSelectorContractScreenQuery.graphql';
import { MainTabStackNavigatorParamList, MainTabStackNavigatorProp } from '~/navigation/types';

export function PostNftSelectorContractScreen() {
  const query = useLazyLoadQuery<PostNftSelectorContractScreenQuery>(
    graphql`
      query PostNftSelectorContractScreenQuery {
        ...NftSelectorContractFragment
      }
    `,
    {}
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftSelectorContractScreen'>>();

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      navigation.navigate('PostComposer', {
        tokenId,
      });
    },
    [navigation]
  );

  return (
    <NftSelectorContract
      contractAddress={route.params.contractAddress}
      onSelectNft={handleSelectNft}
      queryRef={query}
      isCreator={route.params.ownerFilter === 'Created'}
      isFullScreen
    />
  );
}
