import { TouchableOpacity, View } from 'react-native';

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
      <View className="h-full">
        <View className="flex-1 items-center justify-center">
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-lg"
          >
            No Results
          </Typography>
        </View>
      </View>
    );

  return (
    <View className="py-2">
      <View className="flex flex-row items-center justify-between py-2 px-4">
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Medium',
          }}
          className="text-metal text-xs uppercase"
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
      {children}
    </View>
  );
}
