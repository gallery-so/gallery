import { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useSearchContext } from 'src/components/Search/SearchContext';
import { SearchFilter } from 'src/components/Search/SearchFilter';
import { SearchFilterType } from 'src/components/Search/SearchFilter';
import { SearchInput } from 'src/components/Search/SearchInput';
import { SearchResults } from 'src/components/Search/SearchResults';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { SearchDefault } from '~/components/Search/SearchDefault';
import { SearchScreenQuery } from '~/generated/SearchScreenQuery.graphql';

export function SearchScreen() {
  const [filter, setFilter] = useState<SearchFilterType>('top');
  const { keyword } = useSearchContext();

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
      className="flex flex-1 flex-col bg-white dark:bg-black-900"
    >
      <View className="flex flex-col space-y-2 p-4">
        <SearchInput inputRef={searchInputRef} setFilter={setFilter} />
        {keyword && <SearchFilter activeFilter={filter} onChange={setFilter} />}
      </View>

      <GalleryTouchableOpacity
        withoutFeedback
        onPressIn={blurInputFocus}
        eventElementId={null}
        eventName={null}
        eventContext={null}
      >
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
      </GalleryTouchableOpacity>
    </KeyboardAvoidingView>
  );
}
