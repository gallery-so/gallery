import { View } from 'react-native';
import { SearchFilter } from 'src/components/Search/SearchFilter';
import { SearchInput } from 'src/components/Search/SearchInput';
import { SearchSection } from 'src/components/Search/SearchSection';

export function SearchScreen() {
  return (
    <View>
      <View className="flex  flex-col space-y-2 p-4">
        <SearchInput />
        <SearchFilter />
      </View>

      <View className="p-4">
        <SearchSection />
      </View>
    </View>
  );
}
