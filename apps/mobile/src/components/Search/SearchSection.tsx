import { TouchableOpacity, View } from 'react-native';
import { Typography } from '../Typography';
import { SearchResult } from './SearchResult';

export function SearchSection() {
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
            Curators
          </Typography>

          <TouchableOpacity onPress={() => {}}>
            <Typography
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
              className="border-b border-black"
            >
              Show all
            </Typography>
          </TouchableOpacity>
        </View>

        <View className="flex flex-col ">
          <SearchResult />
          <SearchResult />
          <SearchResult />
        </View>
      </View>
    </View>
  );
}
