import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { DragIcon } from 'src/icons/DragIcon';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedCollection } from '~/contexts/GalleryEditor/types';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import ProcessedText from '../ProcessedText/ProcessedText';
import { BaseM } from '../Text';
import { GalleryEditorRow } from './GalleryEditorRow';

type Props = {
  collection: StagedCollection;
};

export function GalleryEditorSection({ collection }: Props) {
  const { collectionIdBeingEdited, activeSectionId, activateCollection } =
    useGalleryEditorActions();

  const highlightedSection = useMemo(() => {
    return collectionIdBeingEdited === collection.dbid && !activeSectionId;
  }, [collection.dbid, collectionIdBeingEdited, activeSectionId]);

  const handleSelectSection = useCallback(() => {
    activateCollection(collection.dbid);
  }, [activateCollection, collection.dbid]);

  return (
    <GalleryTouchableOpacity
      onPress={handleSelectSection}
      eventElementId={null}
      eventName={null}
      eventContext={null}
    >
      <View
        className={clsx('border border-transparent space-y-4 p-2 relative', {
          'border-activeBlue': highlightedSection,
        })}
      >
        {highlightedSection && (
          <View className="absolute right-2 top-2 flex-row gap-1 z-10">
            <View className="h-6 w-7 rounded-sm bg-activeBlue px-1 py-0.5">
              <DragIcon />
            </View>
          </View>
        )}
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
    </GalleryTouchableOpacity>
  );
}
