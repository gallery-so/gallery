import { View } from 'react-native';

const ROWS = 6;
const COLUMNS = 3;

export function NftSelectorLoadingSkeleton() {
  return (
    <View className="flex flex-col space-y-2 p-2">
      {Array.from({ length: ROWS }).map((_, i) => {
        return (
          <View key={i} className="flex flex-row space-x-2">
            {Array.from({ length: COLUMNS }).map((_, j) => {
              return (
                <View key={j} className="flex-1 aspect-square bg-offWhite dark:bg-black-800" />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
