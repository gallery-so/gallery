import { useDraggable, useDroppable } from '@mgcrea/react-native-dnd';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { GestureResponderEvent, useWindowDimensions, View, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedRow } from '~/contexts/GalleryEditor/types';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { BaseM } from '../Text';
import { GalleryEditorActiveActions } from './GalleryEditorActiveActions';
import { GalleryEditorTokenPreview } from './GalleryEditorTokenPreview';

const horizontalRowPadding = 16;
const inBetweenColumnPadding = 0;

type Props = {
  sectionId: string;
  row: StagedRow;
  style?: ViewProps['style'];
};

export function GalleryEditorRow({ sectionId, row, style }: Props) {
  const { activateRow, activeRowId } = useGalleryEditorActions();

  const { offset, setNodeRef, activeId, setNodeLayout } = useDraggable({
    id: row.id,
    data: {
      id: row.id,
      sectionId,
      type: 'row',
    },
    disabled: false,
  });

  const { setNodeRef: setDropRef, setNodeLayout: setDropLayout } = useDroppable({
    id: row.id,
    data: {
      id: row.id,
      sectionId,
      type: 'row',
    },
    disabled: false,
  });

  const screenDimensions = useWindowDimensions();

  const column = row.columns;
  const totalSpaceForTokens =
    screenDimensions.width - horizontalRowPadding * 2 - inBetweenColumnPadding * (column - 1);

  const widthPerToken = totalSpaceForTokens / column;

  const handleSectionPress = useCallback(
    (e: GestureResponderEvent) => {
      e.stopPropagation();
      activateRow(sectionId, row.id);
    },
    [activateRow, sectionId, row.id]
  );

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeId.value === row.id;
    const style = {
      opacity: isActive ? 0.5 : 1,
      zIndex: isActive ? 999 : 1,
      transform: [
        {
          translateX: offset.x.value,
        },
        {
          translateY: offset.y.value,
        },
      ],
    };
    return style;
  }, [row.id]);

  return (
    <Animated.View
      className={clsx('border border-transparent gap-4')}
      ref={(ref) => {
        setNodeRef(ref);
        setDropRef(ref);
      }}
      onLayout={(event) => {
        setNodeLayout(event);
        setDropLayout(event);
      }}
      style={animatedStyle}
    >
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
            {row.items.map((item) => {
              if (item.kind === 'whitespace') {
                return <BaseM key={item.id}>Whitespace</BaseM>;
              } else {
                return (
                  <View
                    key={item.id}
                    className="aspect-square"
                    style={{
                      width: widthPerToken - 8,
                    }}
                  >
                    <GalleryEditorTokenPreview tokenRef={item.tokenRef} />
                  </View>
                );
              }
            })}
          </View>
          {activeRowId === row.id && <GalleryEditorActiveActions row={row} />}
        </View>
      </GalleryTouchableOpacity>
    </Animated.View>
  );
}
