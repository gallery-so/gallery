import { Suspense, useState } from 'react';
import { Text, View } from 'react-native';
import { SearchFilter } from 'src/components/Search/SearchFilter';
import { SearchFilterType } from 'src/components/Search/SearchFilter';
import { SearchInput } from 'src/components/Search/SearchInput';
import { SearchResults } from 'src/components/Search/SearchResults';

export function SearchScreen() {
  const [keyword, setKeyword] = useState<string>('rob');
  const [filter, setFilter] = useState<SearchFilterType>(null);

  return (
    <View>
      <View className="flex  flex-col space-y-2 p-4">
        <SearchInput value={keyword} onChangeText={setKeyword} />
        <SearchFilter activeFilter={filter} onChange={setFilter} />
      </View>

      <View className=" flex h-full max-h-full p-4">
        <Suspense fallback={<Text>Loading...</Text>}>
          {keyword && (
            <SearchResults activeFilter={filter} keyword={keyword} onChangeFilter={setFilter} />
          )}
        </Suspense>
      </View>
    </View>
  );
}
