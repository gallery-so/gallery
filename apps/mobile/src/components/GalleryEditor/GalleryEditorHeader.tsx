import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryEditorHeaderFragment$key } from '~/generated/GalleryEditorHeaderFragment.graphql';

import { BaseM } from '../Text';
import { Typography } from '../Typography';

type Props = {
  galleryRef: GalleryEditorHeaderFragment$key;
};

export function GalleryEditorHeader({ galleryRef }: Props) {
  const gallery = useFragment(
    graphql`
      fragment GalleryEditorHeaderFragment on Gallery {
        name
        description
      }
    `,
    galleryRef
  );

  return (
    <View className="p-4 flex flex-col gap-4">
      <Typography
        font={{
          family: 'GTAlpina',
          weight: 'Light',
        }}
        className="text-[32px] leading-[36px] text-black-900 dark:text-white"
      >
        {gallery.name ?? 'My Gallery'}
      </Typography>
      <BaseM classNameOverride="text-metal">
        {gallery.description || 'Add an optional description....'}
      </BaseM>
    </View>
  );
}
