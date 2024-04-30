import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { Button } from '~/components/Button';
import { NftSelectorContractHeader } from '~/components/NftSelector/NftSelectorContract/NftSelectorContractHeader';
import { NftSelectorContractPickerGrid } from '~/components/NftSelector/NftSelectorContract/NftSelectorContractPickerGrid';
import { NftSelectorContractToolbar } from '~/components/NftSelector/NftSelectorContract/NftSelectorContractToolbar';
import { NftSelectorContractWrapper } from '~/components/NftSelector/NftSelectorContract/NftSelectorContractWrapper';
import { GalleryEditorNftSelectorContractScreenQuery } from '~/generated/GalleryEditorNftSelectorContractScreenQuery.graphql';
import { RootStackNavigatorParamList, RootStackNavigatorProp } from '~/navigation/types';

import { SelectedItemMultiMode } from './GalleryEditorNftSelector';

export function GalleryEditorNftSelectorContractScreen() {
  const query = useLazyLoadQuery<GalleryEditorNftSelectorContractScreenQuery>(
    graphql`
      query GalleryEditorNftSelectorContractScreenQuery {
        viewer {
          ... on Viewer {
            user {
              tokens {
                __typename
                dbid
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

  const navigation = useNavigation<RootStackNavigatorProp>();
  const route =
    useRoute<RouteProp<RootStackNavigatorParamList, 'NftSelectorContractGalleryEditor'>>();

  const [isMultiselectMode, setIsMultiselectMode] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<SelectedItemMultiMode[]>([]);

  const contractAddress = route.params.contractAddress;
  const isCreator = route.params.ownerFilter === 'Created';

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

  const handleSelectNft = useCallback(
    (tokenId: string) => {
      if (isMultiselectMode) {
        setSelectedTokens((prevTokens) => {
          if (
            prevTokens.some((token) => {
              return token.id === tokenId;
            })
          ) {
            return [
              ...prevTokens.filter((token) => {
                return token.id !== tokenId;
              }),
            ];
          } else {
            return [
              ...prevTokens,
              {
                id: tokenId,
              },
            ];
          }
        });
      } else {
        navigation.navigate({
          name: 'GalleryEditor',
          params: {
            galleryId: route.params.galleryId,
            stagedTokens: [tokenId],
          },
          merge: true,
        });
      }
    },
    [navigation, isMultiselectMode, route.params.galleryId]
  );

  const handleAddSelectedTokens = useCallback(() => {
    const formattedTokens = selectedTokens.map((token) => token.id);

    navigation.navigate({
      name: 'GalleryEditor',
      params: {
        galleryId: route.params.galleryId,
        stagedTokens: formattedTokens,
      },
      merge: true,
    });
  }, [navigation, route.params.galleryId, selectedTokens]);

  const handleSelectedAllPress = useCallback(() => {
    setSelectedTokens((prevTokens) => {
      if (prevTokens.length > 0) {
        return [];
      } else {
        return nonNullableTokens.map((token) => {
          return {
            id: token.dbid,
          };
        });
      }
    });
  }, [nonNullableTokens]);

  return (
    <NftSelectorContractWrapper isFullscreen>
      <NftSelectorContractHeader
        title="Select items to add"
        isCreator={isCreator}
        contractId={contractId}
        rightButton={
          selectedTokens.length > 0 ? (
            <Button
              onPress={handleAddSelectedTokens}
              eventElementId={null}
              eventName={null}
              eventContext={null}
              text="add"
              size="xs"
              fontWeight="Bold"
              textTransform="capitalize"
            />
          ) : null
        }
      />
      <NftSelectorContractToolbar
        contractName={contractName}
        isMultiselectMode={isMultiselectMode}
        setIsMultiselectMode={setIsMultiselectMode}
        onSelectedAllPress={handleSelectedAllPress}
        hasSelectedItems={selectedTokens.length > 0}
      />
      <NftSelectorContractPickerGrid
        isCreator={isCreator}
        tokenRefs={nonNullableTokens}
        onSelect={handleSelectNft}
        isMultiselectMode={isMultiselectMode}
        selectedTokens={selectedTokens}
      />
    </NftSelectorContractWrapper>
  );
}
