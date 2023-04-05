import { useState } from 'react';
import { View } from 'react-native';
import { useSearchContext } from 'src/components/Search/SearchContext';
import { SearchFilter } from 'src/components/Search/SearchFilter';
import { SearchFilterType } from 'src/components/Search/SearchFilter';
import { SearchInput } from 'src/components/Search/SearchInput';
import { SearchResults } from 'src/components/Search/SearchResults';

export function SearchScreen() {
  const [filter, setFilter] = useState<SearchFilterType>(null);
  const { keyword } = useSearchContext();

  return (
    <View>
      <View className="flex  flex-col space-y-2 p-4">
        <SearchInput />
        <SearchFilter activeFilter={filter} onChange={setFilter} />
      </View>

      <View className=" flex h-full max-h-full">
        {keyword && <SearchResults activeFilter={filter} onChangeFilter={setFilter} />}
      </View>
    </View>
  );
}
