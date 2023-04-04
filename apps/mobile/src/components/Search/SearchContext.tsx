import { createContext, memo, ReactNode, useContext, useMemo, useState } from 'react';
import useDebounce from 'src/hooks/useDebounce';

type SearchState = {
  keyword: string;
  setKeyword: (keyword: string) => void;
};

const SearchContext = createContext<SearchState | undefined>(undefined);

export const useSearchContext = (): SearchState => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('Attempted to use SearchContext without a provider!');
  }
  return context;
};

type Props = { children: ReactNode };

const SearchProvider = memo(({ children }: Props) => {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 200);
  const value = useMemo(
    () => ({
      setKeyword,
      keyword: debouncedKeyword,
    }),
    [debouncedKeyword, setKeyword]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
});

SearchProvider.displayName = 'SearchProvider';

export default SearchProvider;
