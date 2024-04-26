import { FlashList } from '@shopify/flash-list';
import { useEffect, useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import { AnimatedRef, SharedValue, useSharedValue } from 'react-native-reanimated';

import { StagedItem } from '~/contexts/GalleryEditor/types';

import { ListItemType } from '../GalleryEditorRenderer';
import { GalleryEditorTokenPreview } from '../GalleryEditorTokenPreview';
import { SortableToken } from './SortableToken';
import { Positions } from './utils';

type Props = {
  columns: number;
  items: StagedItem[];
  size: number;

  scrollContentOffsetY: SharedValue<number>;
  scrollViewRef: AnimatedRef<FlashList<ListItemType>>;

  onDragEnd: (data: string[]) => void;
};

export function SortableTokenGrid({
  columns,
  items,
  size,
  scrollContentOffsetY,
  scrollViewRef,
  onDragEnd,
}: Props) {
  const positions = useSharedValue<Positions>(
    Object.assign({}, ...items.map((item, index) => ({ [item.id]: index })))
  );

  useEffect(() => {
    positions.value = Object.assign({}, ...items.map((item, index) => ({ [item.id]: index })));
  }, [items, positions]);

  const containerHeight = useMemo(() => {
    return Math.ceil(items.length / columns) * size;
  }, [items.length, columns, size]);

  return (
    <View
      style={{
        height: containerHeight,
        width: '100%',
      }}
    >
      {items.map((item) => (
        <SortableToken
          key={item.id}
          id={item.id}
          positions={positions}
          size={size}
          columns={columns}
          scrollContentOffsetY={scrollContentOffsetY}
          scrollViewRef={scrollViewRef}
          onDragEnd={onDragEnd}
        >
          <View>
            {item.kind === 'whitespace' ? (
              <WhiteSpace size={size - 8} />
            ) : (
              <View
                className="aspect-square"
                style={{
                  width: size - 8,
                }}
              >
                <GalleryEditorTokenPreview tokenRef={item.tokenRef} />
              </View>
            )}
          </View>
        </SortableToken>
      ))}
    </View>
  );
}

type WhiteSpaceProps = {
  size: number;
  style?: ViewProps['style'];
};

function WhiteSpace({ size, style }: WhiteSpaceProps) {
  return <View style={[{ width: size, height: size }, style]} />;
}
