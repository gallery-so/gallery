import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { TextInput, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { BaseM } from '~/components/Text';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { PublishGalleryFragment$key } from '~/generated/PublishGalleryFragment.graphql';
import { RootStackNavigatorProp } from '~/navigation/types';

import { PublishGalleryBottomSheet } from './PublishGalleryBottomSheet';
import { PublishGalleryPreview } from './PublishGalleryPreview';

type Props = {
  galleryRef: PublishGalleryFragment$key;
};

export function PublishGallery({ galleryRef }: Props) {
  const gallery = useFragment(
    graphql`
      fragment PublishGalleryFragment on Gallery {
        ...PublishGalleryPreviewFragment
      }
    `,
    galleryRef
  );

  const { galleryName, setGalleryName, galleryDescription, setGalleryDescription, saveGallery } =
    useGalleryEditorActions();
  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();
  const navigation = useNavigation<RootStackNavigatorProp>();

  const handleSaveGallery = useCallback(() => {
    saveGallery();
    hideBottomSheetModal();
    navigation.navigate('MainTabs', {
      screen: 'HomeTab',
      params: { screen: 'Home', params: { screen: 'For You', params: {} } },
    });
  }, [hideBottomSheetModal, navigation, saveGallery]);

  const handlePublish = useCallback(() => {
    showBottomSheetModal({
      content: <PublishGalleryBottomSheet onPublish={handleSaveGallery} />,
    });
  }, [handleSaveGallery, showBottomSheetModal]);

  return (
    <>
      <View className="p-4 flex-row items-center justify-between">
        <BackButton />

        <View className="flex-row gap-2">
          <Button
            onPress={handlePublish}
            text="Publish"
            eventElementId={null}
            eventName={null}
            eventContext={null}
            size="xs"
            fontWeight="Bold"
          />
        </View>
      </View>
      <View className="space-y-6">
        <View className="flex-col items-center">
          <TextInput
            className="text-[32px] leading-[36px] text-metal dark:text-white"
            onChangeText={setGalleryName}
            placeholder="My Gallery"
            style={{
              fontFamily: 'GTAlpinaLight',
            }}
            autoCorrect={false}
            spellCheck={false}
          >
            <Typography
              font={{
                family: 'GTAlpina',
                weight: 'Light',
              }}
              className="text-[32px] leading-[36px] text-black-900 dark:text-white"
            >
              {galleryName}
            </Typography>
          </TextInput>
        </View>
        <View className="w-[300] mx-auto">
          <PublishGalleryPreview galleryRef={gallery} />
        </View>
        <View className="items-center">
          <TextInput
            onChangeText={setGalleryDescription}
            placeholder="Add a description (optional)"
            className="text-metal"
            multiline
          >
            <BaseM classNameOverride="text-metal leading-1">{galleryDescription}</BaseM>
          </TextInput>
        </View>
      </View>
    </>
  );
}
