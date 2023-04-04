import { Text, TouchableOpacity, View } from 'react-native';

import { Typography } from '../Typography';
import { NUM_PREVIEW_SEARCH_RESULTS } from './constants';

type Props = {
  title: string;
  children: React.ReactNode;
  onShowAll: () => void;
  isShowAll?: boolean;
  numResults: number;
};

export function SearchSection({ children, isShowAll, numResults, onShowAll, title }: Props) {
  if (!isShowAll && numResults === 0) return null;

  if (isShowAll && numResults === 0)
    return (
      <View className="bg-red flex flex-1 items-center justify-center">
        <Text>No results</Text>
      </View>
    );

  return (
    <View>
      <View>
        <View className="flex flex-row items-center justify-between">
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Medium',
            }}
            className=" text-metal text-xs uppercase"
          >
            {title}
          </Typography>

          {!isShowAll && numResults > NUM_PREVIEW_SEARCH_RESULTS && (
            <TouchableOpacity onPress={onShowAll}>
              <Typography
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
                className="border-b border-black text-sm"
              >
                Show all
              </Typography>
            </TouchableOpacity>
          )}
        </View>

        <View className="flex flex-col">{children}</View>
      </View>
    </View>
  );
}
