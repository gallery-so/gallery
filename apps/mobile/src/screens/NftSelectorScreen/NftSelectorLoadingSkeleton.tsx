import { View } from 'react-native';
import { SpinnerIcon } from 'src/icons/SpinnerIcon';

import { Typography } from '~/components/Typography';

const ROWS = 5;
const COLUMNS = 3;

export function NftSelectorLoadingSkeleton() {
  return (
    <>
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
      <View className="absolute flex justify-center items-center w-full h-full">
        <View className="space-y-2">
          <Typography
            className="text-3xl text-center"
            font={{ family: 'GTAlpina', weight: 'StandardLight', italic: true }}
          >
            Fetching your collection
          </Typography>
          <Typography className="text-center" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            This may take up to a minute
          </Typography>
        </View>
        <SpinnerIcon spin size="s" />
      </View>
    </>
  );
}
