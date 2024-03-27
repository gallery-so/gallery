import { useDraggable, useDroppable } from '@mgcrea/react-native-dnd';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { useWindowDimensions, View, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedSection } from '~/contexts/GalleryEditor/types';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { BaseM } from '../Text';
import { GalleryEditorActiveActions } from './GalleryEditorActiveActions';
import { GalleryEditorTokenPreview } from './GalleryEditorTokenPreview';

const horizontalRowPadding = 16;
const inBetweenColumnPadding = 0;

type Props = {
  collectionId: string;
  section: StagedSection;
  style?: ViewProps['style'];
};

export function GalleryEditorRow({ collectionId, section, style }: Props) {
  const { activateCollection, activateSection, activeSectionId } = useGalleryEditorActions();

  const { offset, setNodeRef, activeId, setNodeLayout } = useDraggable({
    id: section.id,
    data: {
      id: section.id,
      sectionId: collectionId,
      type: 'row',
    },
    disabled: false,
  });

  const { setNodeRef: setDropRef, setNodeLayout: setDropLayout } = useDroppable({
    id: section.id,
    data: {
      id: section.id,
      sectionId: collectionId,
      type: 'row',
    },
    disabled: false,
  });

  const screenDimensions = useWindowDimensions();

  const column = section.columns;
  const totalSpaceForTokens =
    screenDimensions.width - horizontalRowPadding * 2 - inBetweenColumnPadding * (column - 1);

  const widthPerToken = totalSpaceForTokens / column;

  const handleSectionPress = useCallback(
    (sectionId: string) => {
      activateCollection(collectionId);
      activateSection(sectionId);
    },
    [activateCollection, activateSection, collectionId]
  );

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeId.value === section.id;
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
  }, [section.id]);

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
        onPress={(e) => {
          e.stopPropagation();
          handleSectionPress(section.id);
        }}
        className={clsx('border border-transparent relative', {
          'border-activeBlue': activeSectionId === section.id,
        })}
        style={style}
      >
        <View>
          <View className="flex-row flex-wrap gap-2">
            {section.items.map((item) => {
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
          {activeSectionId === section.id && <GalleryEditorActiveActions row={section} />}
        </View>
      </GalleryTouchableOpacity>
    </Animated.View>
  );
}
