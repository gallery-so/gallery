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
import { Draggable } from './Draggable';
import { GalleryEditorRow } from './GalleryEditorRow';

type Props = {
  section: StagedSection;
  queryRef: GalleryEditorSectionFragment$key;
};

export function GalleryEditorSection({ section, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorSectionFragment on Query {
        ...GalleryEditorRowFragment
      }
    `,
    queryRef
  );

  const { sectionIdBeingEdited, activeRowId, activateSection, clearActiveRow } =
    useGalleryEditorActions();

  const highlightedSection = useMemo(() => {
    return sectionIdBeingEdited === section.dbid && !activeRowId;
  }, [section.dbid, sectionIdBeingEdited, activeRowId]);

  const handleSelectSection = useCallback(() => {
    activateSection(section.dbid);
    clearActiveRow();
  }, [clearActiveRow, activateSection, section.dbid]);

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

        <View className="space-y-2 z-30">
          {section.rows.map((row, index) => {
            return (
              <Draggable
                key={`${row.id}-${index}`}
                value={{ id: row.id, type: 'row' }}
                disabled={row.id !== activeRowId}
              >
                <GalleryEditorRow sectionId={section.dbid} row={row} queryRef={query} />
              </Draggable>
            );
          })}
        </View>
      </View>
    </GalleryTouchableOpacity>
  );
}
