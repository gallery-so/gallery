import { FlashList } from '@shopify/flash-list';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { GestureResponderEvent, View, ViewProps } from 'react-native';
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
  style?: ViewProps['style'];
  queryRef: GalleryEditorRowFragment$key;

  scrollContentOffsetY: SharedValue<number>;
  scrollViewRef: AnimatedRef<FlashList<ListItemType>>;
};

export function GalleryEditorRow({
  sectionId,
  row,
  style,
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

  const handleDragEnd = useCallback(
    (newPositions: string[]) => {
      moveItem(row.id, newPositions);
    },
    [moveItem, row.id]
  );

  return (
    <Animated.View className={clsx('border border-transparent gap-4')}>
      <GalleryTouchableOpacity
        eventElementId={null}
        eventName={null}
        eventContext={null}
        onPress={handleSectionPress}
        className={clsx('border border-transparent relative', {
          'border-activeBlue': activeRowId === row.id,
        })}
        style={style}
      >
        <View>
          <View className="flex-row flex-wrap gap-2">
            <SortableTokenGrid
              columns={row.columns}
              items={row.items}
              size={widthPerToken}
              scrollContentOffsetY={scrollContentOffsetY}
              scrollViewRef={scrollViewRef}
              onDragEnd={handleDragEnd}
            />
          </View>
          {activeRowId === row.id && <GalleryEditorActiveActions row={row} queryRef={query} />}
        </View>
      </GalleryTouchableOpacity>
    </Animated.View>
  );
}
