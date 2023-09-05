import { useEffect, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useTokenSearchResultsFragment$key } from '~/generated/useTokenSearchResultsFragment.graphql';
import useDebounce from '~/shared/hooks/useDebounce';

type TokenWithDbId<T> = {
  dbid: string;
} & T;

type Props<T> = {
  tokensRef: useTokenSearchResultsFragment$key;
  rawTokensToDisplay: ReadonlyArray<TokenWithDbId<T>>;
};

export default function useTokenSearchResults<T>({ tokensRef, rawTokensToDisplay }: Props<T>) {
  const tokens = useFragment(
    graphql`
      fragment useTokenSearchResultsFragment on Token @relay(plural: true) {
        dbid
        name
        contract {
          name
        }
      }
    `,
    tokensRef
  );

  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  const isSearching = debouncedSearchQuery.length > 0;

  useEffect(() => {
    const lowerCaseQuery = debouncedSearchQuery.toLowerCase();

    const searchResults = tokens
      .filter((token) => {
        if (token.name?.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }

        if (token.contract?.name?.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }

        return false;
      })
      .map((token) => token.dbid);

    setSearchResults(searchResults);
  }, [debouncedSearchQuery, setSearchResults, tokens]);

  const tokensToDisplayFromSearchResults = useMemo(() => {
    if (!debouncedSearchQuery) {
      return rawTokensToDisplay;
    }

    const searchResultsSet = new Set(searchResults);
    return rawTokensToDisplay.filter((token) => searchResultsSet.has(token.dbid));
  }, [debouncedSearchQuery, rawTokensToDisplay, searchResults]);

  return {
    searchQuery,
    setSearchQuery,
    tokenSearchResults: tokensToDisplayFromSearchResults,
    isSearching,
  };
}
