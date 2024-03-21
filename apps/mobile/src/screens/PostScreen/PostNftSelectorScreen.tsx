import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import { NftSelector } from '~/components/NftSelector/NftSelector';
import { useNftSelector } from '~/components/NftSelector/useNftSelector';
import { MainTabStackNavigatorProp } from '~/navigation/types';

export function PostNftSelectorScreen() {
  const { ownershipTypeFilter } = useNftSelector();

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      navigation.navigate('PostComposer', {
        tokenId,
      });
    },
    [navigation]
  );

  const handleSelectNftGroup = useCallback(
    (contractAddress: string) => {
      navigation.navigate('NftSelectorContractScreen', {
        contractAddress: contractAddress,
        page: 'Post',
        ownerFilter: ownershipTypeFilter,
        fullScreen: true,
      });
    },
    [navigation, ownershipTypeFilter]
  );

  return (
    <NftSelector
      onSelectNft={handleSelectNft}
      onSelectNftGroup={handleSelectNftGroup}
      title="Select item to post"
      isFullscreen
    />
  );
}
