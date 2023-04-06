import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSearchContext } from 'src/components/Search/SearchContext';
import { SearchFilter } from 'src/components/Search/SearchFilter';
import { SearchFilterType } from 'src/components/Search/SearchFilter';
import { SearchInput } from 'src/components/Search/SearchInput';
import { SearchResults } from 'src/components/Search/SearchResults';

export function SearchScreen() {
  const [filter, setFilter] = useState<SearchFilterType>(null);
  const { keyword } = useSearchContext();

  const { bottom } = useSafeAreaInsets();

  return (
    <View>
      <View className="flex  flex-col space-y-2 p-4">
        <SearchInput />
        <SearchFilter activeFilter={filter} onChange={setFilter} />
      </View>
      <ScrollView
        contentContainerStyle={{
          // Bottom navbar height + padding
          paddingBottom: 70 + 12 + bottom,
        }}
      >
        {keyword && <SearchResults activeFilter={filter} onChangeFilter={setFilter} />}
      </ScrollView>
    </View>
  );
}
