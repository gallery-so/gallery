import { FlashList } from '@shopify/flash-list';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { GestureResponderEvent, View } from 'react-native';
import Animated, { AnimatedRef, SharedValue } from 'react-native-reanimated';
import { graphql, useFragment } from 'react-relay';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedRow } from '~/contexts/GalleryEditor/types';
import { GalleryEditorRowFragment$key } from '~/generated/GalleryEditorRowFragment.graphql';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { GalleryEditorActiveActions } from './GalleryEditorActiveActions';
import { ListItemType } from './GalleryEditorRenderer';
import { SortableTokenGrid } from './SortableTokenGrid/SortableTokenGrid';
import { useWidthPerToken } from './useWidthPerToken';

type Props = {
  sectionId: string;
  row: StagedRow;
  queryRef: GalleryEditorRowFragment$key;

  scrollContentOffsetY: SharedValue<number>;
  scrollViewRef: AnimatedRef<FlashList<ListItemType>>;
};

export function GalleryEditorRow({
  sectionId,
  row,
  queryRef,
  scrollContentOffsetY,
  scrollViewRef,
}: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorRowFragment on Query {
        ...GalleryEditorActiveActionsFragment
      }
    `,
    queryRef
  );

  const { activateRow, activeRowId, moveItem } = useGalleryEditorActions();

  const widthPerToken = useWidthPerToken(row.columns);

  const handleSectionPress = useCallback(
    (e: GestureResponderEvent) => {
      e.stopPropagation();
      activateRow(sectionId, row.id);
    },
    [activateRow, sectionId, row.id]
  );

  const handleDragStart = useCallback(() => {
    activateRow(sectionId, row.id);
  }, [activateRow, sectionId, row.id]);

  const handleDragEnd = useCallback(
    (newPositionsById: string[]) => {
      moveItem(row.id, newPositionsById);
    },
    [moveItem, row.id]
  );

  return (
    <Animated.View className={clsx('border border-transparent')}>
      <GalleryTouchableOpacity
        eventElementId={null}
        eventName={null}
        eventContext={null}
        onPress={handleSectionPress}
        withoutFeedback
      >
        <View
          className={clsx('border border-transparent relative', {
            'border-activeBlue': activeRowId === row.id,
          })}
        >
          <View className="relative">
            <SortableTokenGrid
              columns={row.columns}
              items={row.items}
              size={widthPerToken}
              scrollContentOffsetY={scrollContentOffsetY}
              scrollViewRef={scrollViewRef}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </View>
          {activeRowId === row.id && <GalleryEditorActiveActions row={row} queryRef={query} />}
        </View>
      </GalleryTouchableOpacity>
    </Animated.View>
  );
}
