import { TextInput, View } from 'react-native';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';

import { BaseM } from '../Text';
import { Typography } from '../Typography';

export function GalleryEditorHeader() {
  const { galleryName, setGalleryName, galleryDescription, setGalleryDescription } =
    useGalleryEditorActions();

  return (
    <View className="p-4 flex flex-col gap-4">
      <TextInput
        className="text-[32px] leading-[36px] text-metal dark:text-white"
        onChangeText={setGalleryName}
        placeholder="My Gallery"
      >
        <Typography
          font={{
            family: 'GTAlpina',
            weight: 'Light',
          }}
          className="text-[32px] leading-[36px] 
        text-black-900
         dark:text-white"
        >
          {galleryName}
        </Typography>
      </TextInput>
      <TextInput onChangeText={setGalleryDescription} placeholder="Add an optional description....">
        <BaseM classNameOverride="text-metal">{galleryDescription}</BaseM>
      </TextInput>
    </View>
  );
}
