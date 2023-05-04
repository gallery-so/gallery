import { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useSearchContext } from 'src/components/Search/SearchContext';
import { SearchFilter } from 'src/components/Search/SearchFilter';
import { SearchFilterType } from 'src/components/Search/SearchFilter';
import { SearchInput } from 'src/components/Search/SearchInput';
import { SearchResults } from 'src/components/Search/SearchResults';

import { SearchDefault } from '~/components/Search/SearchDefault';
import { SearchScreenQuery } from '~/generated/SearchScreenQuery.graphql';

export function SearchScreen() {
  const [filter, setFilter] = useState<SearchFilterType>('top');
  const { keyword } = useSearchContext();
  const { top } = useSafeAreaInsets();

  const query = useLazyLoadQuery<SearchScreenQuery>(
    graphql`
      query SearchScreenQuery {
        ...SearchDefaultFragment
      }
    `,
    {}
  );

  const searchInputRef = useRef<TextInput>(null);
  const blurInputFocus = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: top }}
      className="flex flex-1 flex-col bg-white dark:bg-black"
    >
      <View className="flex flex-col space-y-2 p-4">
        <SearchInput inputRef={searchInputRef} setFilter={setFilter} />
        {keyword && <SearchFilter activeFilter={filter} onChange={setFilter} />}
      </View>

      <TouchableWithoutFeedback onPressIn={blurInputFocus}>
        {keyword ? (
          <View className="flex-grow">
            <SearchResults
              activeFilter={filter}
              onChangeFilter={setFilter}
              blurInputFocus={blurInputFocus}
            />
          </View>
        ) : (
          <SearchDefault queryRef={query} blurInputFocus={blurInputFocus} />
        )}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
