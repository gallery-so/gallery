import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { NftSelectorContract } from '~/components/NftSelector/NftSelectorContract/NftSelectorContract';
import { GalleryEditorNftSelectorContractScreenQuery } from '~/generated/GalleryEditorNftSelectorContractScreenQuery.graphql';
import { RootStackNavigatorParamList, RootStackNavigatorProp } from '~/navigation/types';

export function GalleryEditorNftSelectorContractScreen() {
  const query = useLazyLoadQuery<GalleryEditorNftSelectorContractScreenQuery>(
    graphql`
      query GalleryEditorNftSelectorContractScreenQuery {
        ...NftSelectorContractFragment
      }
    `,
    {}
  );

  const navigation = useNavigation<RootStackNavigatorProp>();
  const route =
    useRoute<RouteProp<RootStackNavigatorParamList, 'NftSelectorContractGalleryEditor'>>();

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
