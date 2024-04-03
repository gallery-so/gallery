import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { NftSelectorContract } from '~/components/NftSelector/NftSelectorContract/NftSelectorContract';
import { PfpSelectorContractScreenQuery } from '~/generated/PfpSelectorContractScreenQuery.graphql';
import { MainTabStackNavigatorParamList, MainTabStackNavigatorProp } from '~/navigation/types';

import { useProfilePicture } from '../NftSelectorScreen/useProfilePicture';

export function PfpSelectorContractScreen() {
  const query = useLazyLoadQuery<PfpSelectorContractScreenQuery>(
    graphql`
      query PfpSelectorContractScreenQuery {
        ...NftSelectorContractFragment
      }
    `,
    {}
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftSelectorContractScreen'>>();
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

  return (
    <NftSelectorContract
      contractAddress={route.params.contractAddress}
      onSelectNft={handleSelectNft}
      queryRef={query}
      isCreator={route.params.ownerFilter === 'Created'}
    />
  );
}
