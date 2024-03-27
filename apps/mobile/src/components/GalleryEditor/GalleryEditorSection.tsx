import { View } from 'react-native';

import { StagedCollection } from '~/contexts/GalleryEditor/types';

import ProcessedText from '../ProcessedText/ProcessedText';
import { BaseM } from '../Text';
import { GalleryEditorRow } from './GalleryEditorRow';

type Props = {
  collection: StagedCollection;
};

export function GalleryEditorSection({ collection }: Props) {
  return (
    <View className="border border-transparent gap-4 p-2  relative">
      <BaseM classNameOverride="text-base" weight="Bold">
        {collection.name}
      </BaseM>
      <ProcessedText text={collection.collectorsNote || ''} />

      <View className="space-y-2">
        {collection.sections.map((section) => {
          return (
            <GalleryEditorRow key={section.id} collectionId={collection.dbid} section={section} />
          );
        })}
      </View>
    </View>
  );
}
