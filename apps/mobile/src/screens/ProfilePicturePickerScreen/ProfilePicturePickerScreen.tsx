import { Picker } from '@react-native-picker/picker';
import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { RefreshIcon } from 'src/icons/RefreshIcon';
import { SlidersIcon } from 'src/icons/SlidersIcon';

import { BackButton } from '~/components/BackButton';
import { FadedInput } from '~/components/FadedInput';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { IconContainer } from '~/components/IconContainer';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Select } from '~/components/Select';
import { Typography } from '~/components/Typography';
import { SearchIcon } from '~/navigation/MainTabNavigator/SearchIcon';

import { ProfilePicturePickerFilterBottomSheet } from './ProfilePicturePickerFilterBottomSheet';

export function ProfilePicturePickerScreen() {
  const query = useLazyLoadQuery(
    graphql`
      query ProfilePicturePickerScreenQuery {
        ...ProfilePicturePickerGridFragment
      }
    `,
    {}
  );

  const { top } = useSafeAreaPadding();
  const filterBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleSettingsPress = useCallback(() => {
    filterBottomSheetRef.current?.present();
  }, []);

  return (
    <View className="flex-1 bg-white dark:bg-black-900" style={{ paddingTop: top }}>
      <View className="flex flex-col space-y-8">
        <View className="px-4 relative">
          <BackButton />

          <View className="absolute inset-0 flex flex-row justify-center items-center">
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              Select a profile picture
            </Typography>
          </View>
        </View>

        <View className="px-4 flex flex-col space-y-4">
          <FadedInput
            // TODO: Follow up w/ Fraser on input divergence here
            style={{ height: 36 }}
            icon={<SearchIcon width={16} height={16} />}
            placeholder="Search collection"
          />

          <View className="flex flex-row items-center justify-between">
            <View />

            <View className="flex flex-row space-x-1">
              <IconContainer
                size="sm"
                onPress={() => {}}
                icon={<RefreshIcon />}
                eventElementId="ProfilePictureSelectorRefreshButton"
                eventName="ProfilePictureSelectorRefreshButton pressed"
              />
              <IconContainer
                size="sm"
                onPress={handleSettingsPress}
                icon={<SlidersIcon />}
                eventElementId="ProfilePictureSelectorSettingsButton"
                eventName="ProfilePictureSelectorSettingsButton pressed"
              />

              <ProfilePicturePickerFilterBottomSheet ref={filterBottomSheetRef} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
