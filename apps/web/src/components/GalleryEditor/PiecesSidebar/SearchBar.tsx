import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import { FadedInput } from '~/components/core/Input/FadedInput';
import { SearchBarNewFragment$key } from '~/generated/SearchBarNewFragment.graphql';
import useDebounce from '~/hooks/useDebounce';

type Props = {
  tokensRef: SearchBarNewFragment$key;
  setSearchResults: Dispatch<SetStateAction<string[]>>;
  setDebouncedSearchQuery: Dispatch<SetStateAction<string>>;
};

function SearchBar({ tokensRef, setSearchResults, setDebouncedSearchQuery }: Props) {
  const tokens = useFragment(
    graphql`
      fragment SearchBarNewFragment on Token @relay(plural: true) {
        dbid
        name
        contract {
          name
        }
      }
    `,
    tokensRef
  );

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

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

    setDebouncedSearchQuery(debouncedSearchQuery);
    setSearchResults(searchResults);
  }, [debouncedSearchQuery, setDebouncedSearchQuery, setSearchResults, tokens]);

  return (
    <FadedInput
      size="md"
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder="Search pieces"
    />
  );
}

export default SearchBar;
