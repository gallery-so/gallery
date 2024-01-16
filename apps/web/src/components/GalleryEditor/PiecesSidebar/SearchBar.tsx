import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import { FadedInput } from '~/components/core/Input/FadedInput';
import { SearchBarFragment$key } from '~/generated/SearchBarFragment.graphql';
import useDebounce from '~/shared/hooks/useDebounce';

type Props = {
  tokensRef: SearchBarFragment$key;
  setSearchResults: Dispatch<SetStateAction<string[]>>;
  setDebouncedSearchQuery: Dispatch<SetStateAction<string>>;
};

function SearchBar({ tokensRef, setSearchResults, setDebouncedSearchQuery }: Props) {
  const tokens = useFragment(
    graphql`
      fragment SearchBarFragment on Token @relay(plural: true) {
        dbid
        definition {
          name
          community {
            name
          }
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
        if (token.definition.name?.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }

        if (token.definition.community?.name?.toLowerCase().includes(lowerCaseQuery)) {
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
