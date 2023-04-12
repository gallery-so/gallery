import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSearchContext } from 'src/components/Search/SearchContext';
import { SearchFilter } from 'src/components/Search/SearchFilter';
import { SearchFilterType } from 'src/components/Search/SearchFilter';
import { SearchInput } from 'src/components/Search/SearchInput';
import { SearchResults } from 'src/components/Search/SearchResults';

export function SearchScreen() {
  const [filter, setFilter] = useState<SearchFilterType>(null);
  const { keyword } = useSearchContext();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex flex-1 flex-col"
    >
      <View className="flex flex-col space-y-2 p-4">
        <SearchInput />
        <SearchFilter activeFilter={filter} onChange={setFilter} />
      </View>

      {keyword && (
        <View className="flex-grow">
          <SearchResults activeFilter={filter} onChangeFilter={setFilter} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
