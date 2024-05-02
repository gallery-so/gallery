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

  onDragStart: () => void;
  onDragEnd: (data: string[]) => void;
};

const GAP = 8;

export function SortableTokenGrid({
  columns,
  items,
  size,
  scrollContentOffsetY,
  scrollViewRef,
  onDragStart,
  onDragEnd,
}: Props) {
  const positions = useSharedValue<Positions>(
    Object.assign({}, ...items.map((item, index) => ({ [item.id]: index })))
  );

  const animatedId = useSharedValue<string | null>(null);

  useEffect(() => {
    positions.value = Object.assign({}, ...items.map((item, index) => ({ [item.id]: index })));
  }, [items, positions]);

  const containerHeight = useMemo(() => {
    const rows = Math.ceil(items.length / columns);
    return rows * (size + GAP) - GAP - rows * GAP; // Subtract GAP to remove the extra gap after the first and last row
  }, [items.length, columns, size]);

  const style = useMemo<ViewProps['style']>(() => {
    return {
      height: containerHeight,
    };
  }, [containerHeight]);

  return (
    <View style={style}>
      {items.map((item) => (
        <SortableToken
          key={item.id}
          id={item.id}
          positions={positions}
          animatedId={animatedId}
          size={size}
          columns={columns}
          scrollContentOffsetY={scrollContentOffsetY}
          scrollViewRef={scrollViewRef}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <View>
            {item.kind === 'whitespace' ? (
              <WhiteSpace size={size - GAP} />
            ) : (
              <View
                className="aspect-square flex"
                style={{
                  width: size - GAP,
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

export function WhiteSpace({ size, style }: WhiteSpaceProps) {
  return <View style={[{ width: size, height: size }, style]} />;
}
