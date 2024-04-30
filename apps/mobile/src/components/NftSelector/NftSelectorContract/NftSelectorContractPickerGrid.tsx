import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryRefreshControl } from '~/components/GalleryRefreshControl';
import { useSyncTokensActions } from '~/contexts/SyncTokensContext';
import { NftSelectorContractPickerGridFragment$key } from '~/generated/NftSelectorContractPickerGridFragment.graphql';
import { SelectedItemMultiMode } from '~/screens/GalleryScreen/GalleryEditorNftSelector';
import { NftSelectorLoadingSkeleton } from '~/screens/NftSelectorScreen/NftSelectorLoadingSkeleton';
import { NftSelectorPickerSingularAsset } from '~/screens/NftSelectorScreen/NftSelectorPickerSingularAsset';

type Props = {
  isCreator: boolean;
  tokenRefs: NftSelectorContractPickerGridFragment$key;
  onSelect: (tokenId: string) => void;
  style?: ViewProps['style'];

  isMultiselectMode?: boolean;
  selectedTokens?: SelectedItemMultiMode[];
};

export function NftSelectorContractPickerGrid({
  isCreator,
  isMultiselectMode,
  tokenRefs,
  onSelect,
  selectedTokens,
  style,
}: Props) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorContractPickerGridFragment on Token @relay(plural: true) {
        dbid
        definition {
          contract {
            dbid
          }
        }

        ...NftSelectorPickerSingularAssetFragment
      }
    `,
    tokenRefs
  );

  const { isSyncingCreatedTokensForContract, syncCreatedTokensForExistingContract } =
    useSyncTokensActions();

  // [TODO-subcomref] might switch this to community ID
  const contractId = tokens[0]?.definition?.contract?.dbid ?? '';

  const handleSyncTokensForContract = useCallback(async () => {
    syncCreatedTokensForExistingContract(contractId);
  }, [syncCreatedTokensForExistingContract, contractId]);

  const isSelected = useMemo(() => {
    const selectedTokenIds = selectedTokens?.map((token) => token.id) ?? [];
    return (tokenId: string) => selectedTokenIds.includes(tokenId);
  }, [selectedTokens]);

  const renderItem = useCallback<ListRenderItem<typeof tokens>>(
    ({ item: row }) => {
      return (
        <View className="flex space-x-4 flex-row mb-4 px-4">
          {row.map((token) => {
            return (
              <NftSelectorPickerSingularAsset
                key={token.dbid}
                onPress={onSelect}
                tokenRef={token}
                isMultiselectMode={isMultiselectMode}
                isSelected={isSelected(token.dbid)}
              />
            );
          })}

          {Array.from({ length: 3 - row.length }).map((_, index) => {
            return <View key={index} className="flex-1 aspect-square" />;
          })}
        </View>
      );
    },
    [isMultiselectMode, isSelected, onSelect]
  );

  const rows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < tokens.length; i += 3) {
      rows.push(tokens.slice(i, i + 3));
    }
    return rows;
  }, [tokens]);

  return (
    <View className="flex-1 w-full" style={style}>
      {isSyncingCreatedTokensForContract ? (
        <NftSelectorLoadingSkeleton />
      ) : (
        <FlashList
          renderItem={renderItem}
          data={rows}
          estimatedItemSize={100}
          extraData={[isMultiselectMode, selectedTokens]}
          refreshControl={
            isCreator ? (
              <GalleryRefreshControl
                refreshing={isSyncingCreatedTokensForContract}
                onRefresh={handleSyncTokensForContract}
              />
            ) : undefined
          }
        />
      )}
    </View>
  );
}
