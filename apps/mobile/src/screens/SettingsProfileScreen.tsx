import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { Markdown } from '~/components/Markdown';
import { PfpBottomSheet } from '~/components/PfpPicker/PfpBottomSheet';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { SettingsProfileScreenQuery } from '~/generated/SettingsProfileScreenQuery.graphql';
import colors from '~/shared/theme/colors';

export function SettingsProfileScreen() {
  const { top } = useSafeAreaPadding();

  const query = useLazyLoadQuery<SettingsProfileScreenQuery>(
    graphql`
      query SettingsProfileScreenQuery {
        viewer {
          ... on Viewer {
            user {
              bio
              username

              ...ProfilePictureFragment
            }
          }
        }

        ...PfpBottomSheetFragment
      }
    `,
    {}
  );

  const user = query.viewer?.user;

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handlePress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <View style={{ paddingTop: top }} className="flex-1 flex flex-col bg-white dark:bg-black-900">
      <View className="px-4 pb-8">
        <BackButton />
      </View>

      <View className="px-4 flex flex-col space-y-4">
        <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Your profile
        </Typography>

        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Edit your profile details
        </Typography>
      </View>

      <View className="flex items-center justify-center px-4 py-6">
        <ProfilePicture userRef={user} size="xl" isEditable onPress={handlePress} />

        <PfpBottomSheet ref={bottomSheetRef} queryRef={query} />
      </View>

      <View className="px-3 py-4 bg-offWhite flex flex-row justify-between mx-4">
        <View className="flex flex-col space-y-2">
          <Typography className="text-2xl" font={{ family: 'GTAlpina', weight: 'StandardLight' }}>
            {user.username}
          </Typography>

          <View>
            <Markdown style={markdownOverrides} numberOfLines={1}>
              {user.bio}
            </Markdown>
          </View>
        </View>

        <Button size="sm" variant="secondary" text="EDIT" eventElementId={null} eventName={null} />
      </View>
    </View>
  );
}

const markdownOverrides = StyleSheet.create({
  body: {
    color: colors.shadow,
  },
});
