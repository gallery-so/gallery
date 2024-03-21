import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import { NftSelector } from '~/components/NftSelector/NftSelector';
import { useNftSelector } from '~/components/NftSelector/useNftSelector';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { useProfilePicture } from '../NftSelectorScreen/useProfilePicture';

export function PfpSelectorScreen() {
  const { ownershipTypeFilter } = useNftSelector();

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const { setProfileImage } = useProfilePicture();

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      setProfileImage(tokenId).then(() => {
        navigation.pop();
      });
    },
    [navigation, setProfileImage]
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
      title="Select profile picture"
      onSelectNft={handleSelectNft}
      onSelectNftGroup={handleSelectNftGroup}
    />
  );
}
