import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { DragIcon } from 'src/icons/DragIcon';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedSection } from '~/contexts/GalleryEditor/types';
import { GalleryEditorSectionFragment$key } from '~/generated/GalleryEditorSectionFragment.graphql';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import ProcessedText from '../ProcessedText/ProcessedText';
import { BaseM } from '../Text';
import { SortableRowList } from './SortableRowList';

type Props = {
  section: StagedSection;
  queryRef: GalleryEditorSectionFragment$key;
};

export function GalleryEditorSection({ section, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorSectionFragment on Query {
        ...SortableRowListFragment
      }
    `,
    queryRef
  );

  const { sectionIdBeingEdited, activeRowId, activateSection, clearActiveRow, moveRow } =
    useGalleryEditorActions();

  const highlightedSection = useMemo(() => {
    return sectionIdBeingEdited === section.dbid && !activeRowId;
  }, [section.dbid, sectionIdBeingEdited, activeRowId]);

  const handleSelectSection = useCallback(() => {
    activateSection(section.dbid);
    clearActiveRow();
  }, [clearActiveRow, activateSection, section.dbid]);

  const handleDragEnd = useCallback(
    (newPositions: string[]) => {
      moveRow(section.dbid, newPositions);
    },
    [moveRow, section.dbid]
  );

  return (
    <GalleryTouchableOpacity
      onPress={handleSelectSection}
      eventElementId={null}
      eventName={null}
      eventContext={null}
      className="px-2"
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
          {section.name}
        </BaseM>
        <ProcessedText text={section.collectorsNote || ''} />
        <SortableRowList
          rows={section.rows}
          sectionId={section.dbid}
          queryRef={query}
          onDragEnd={handleDragEnd}
        />
      </View>
    </GalleryTouchableOpacity>
  );
}
