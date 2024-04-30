import { useCallback } from 'react';
import { View } from 'react-native';
import { contexts } from 'shared/analytics/constants';
import { MultiSelectIcon } from 'src/icons/MultiSelectIcon';

import { AnimatedRefreshIcon } from '~/components/AnimatedRefreshIcon';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { IconContainer } from '~/components/IconContainer';
import { BaseM } from '~/components/Text';

type Props = {
  contractName: string;
  isMultiselectMode: boolean;
  setIsMultiselectMode: (value: boolean) => void;
  onSelectedAllPress: () => void;
  hasSelectedItems: boolean;
};

export function NftSelectorContractToolbar({
  contractName,
  isMultiselectMode,
  setIsMultiselectMode,
  onSelectedAllPress,
  hasSelectedItems,
}: Props) {
  const handleMultiselectPress = useCallback(() => {
    setIsMultiselectMode?.(!isMultiselectMode);
  }, [isMultiselectMode, setIsMultiselectMode]);

  return (
    <View className="flex-row justify-between px-4 pt-4">
      <BaseM weight="Bold">{contractName}</BaseM>

      <View className="flex-row space-x-2 items-center">
        <GalleryTouchableOpacity
          onPress={onSelectedAllPress}
          eventElementId={null}
          eventName={null}
          eventContext={null}
        >
          <BaseM weight="Bold" classNameOverride="text-shadow">
            {hasSelectedItems ? 'Deselect All' : 'Select All'}
          </BaseM>
        </GalleryTouchableOpacity>
        <IconContainer
          size="sm"
          onPress={handleMultiselectPress}
          icon={<MultiSelectIcon />}
          eventElementId="NftSelectorSelectorSettingsButton"
          eventName="NftSelectorSelectorSettingsButton pressed"
          eventContext={contexts.Posts}
          color={isMultiselectMode ? 'active' : 'default'}
        />
        <AnimatedRefreshIcon
          //   onSync={handleSync}
          //   isSyncing={ownershipTypeFilter === 'Collected' ? isSyncing : isSyncingCreatedTokens}
          onSync={() => {}}
          isSyncing={false}
          eventElementId="NftSelectorSelectorRefreshButton"
          eventName="NftSelectorSelectorRefreshButton pressed"
        />
      </View>
    </View>
  );
}
