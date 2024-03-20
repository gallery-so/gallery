import {
  DndProvider,
  type ObjectWithId,
  Draggable,
  DraggableGrid,
  DraggableStack,
  DraggableStackProps,
} from '@mgcrea/react-native-dnd';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const items: string[] = ['a', 'b', 'c', 'd', 'e'];
const secondItems: string[] = ['f', 'g', 'h', 'i', 'j'];

function formatData(data: string[]): {
  id: string;
}[] {
  return data.map((letter, index) => ({
    id: `${index}-${letter}`,
  }));
}

const firstData = formatData(items) satisfies ObjectWithId[];
const secondData = formatData(secondItems) satisfies ObjectWithId[];

export function GalleryEditorScreen() {
  const onStackOrderChange: DraggableStackProps['onOrderChange'] = (value) => {
    console.log('onStackOrderChange', value);
  };
  const onStackOrderUpdate: DraggableStackProps['onOrderUpdate'] = (value) => {
    console.log('onStackOrderUpdate', value);
  };

  return (
    <SafeAreaView>
      <GestureHandlerRootView>
        <View className="px-4">
          <DndProvider>
            <DraggableStack
              direction="column"
              gap={10}
              style={styles.stack}
              onOrderChange={onStackOrderChange}
              onOrderUpdate={onStackOrderUpdate}
            >
              <Block key="section-1-a" id="section-1-a" items={firstData} column={4} />
              <Block key="section-2-a" id="section-2-a" items={secondData} column={2} />
            </DraggableStack>
          </DndProvider>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

type BlockProps = {
  id: string;
  items: {
    id: string;
  }[];
  column: number;
};
function Block({ id, items, column }: BlockProps) {
  return (
    <Draggable key={id} id={id}>
      <DraggableGrid
        key="grid"
        direction="row"
        size={column}
        style={{
          ...styles.grid,
          width: LETTER_WIDTH * column + LETTER_GAP * (column - 1),
          zIndex: 1,
        }}
      >
        {items.map((item) => (
          <Draggable key={item.id} id={item.id} style={styles.draggable}>
            <Text style={styles.text}>{item.id}</Text>
          </Draggable>
        ))}
      </DraggableGrid>
    </Draggable>
  );
}

const LETTER_WIDTH = 50;
const LETTER_HEIGHT = 50;
const LETTER_GAP = 10;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: LETTER_GAP,
    borderRadius: 32,
  },
  title: {
    color: '#555',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    position: 'absolute',
    top: 10,
    left: 10,
  },
  draggable: {
    backgroundColor: 'seagreen',
    width: LETTER_WIDTH,
    height: LETTER_HEIGHT,
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  stack: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 32,
    borderRadius: 32,
  },
});
