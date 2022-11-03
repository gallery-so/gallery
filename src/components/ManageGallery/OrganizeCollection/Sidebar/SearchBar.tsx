import {
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { SearchBarFragment$key } from '~/generated/SearchBarFragment.graphql';
import useDebounce from '~/hooks/useDebounce';

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

  const handleQueryChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const searchQuery = event.target.value;
      setSearchQuery(searchQuery);
    },
    [setSearchQuery]
  );

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
    <StyledSearchBar>
      <StyledSearchInput onChange={handleQueryChange} placeholder="Search pieces" />
    </StyledSearchBar>
  );
}

const StyledSearchBar = styled.div``;

const StyledSearchInput = styled.input`
  border: none;
  width: 100%;
  padding: 8px;
  padding-left: 16px;
  color: ${colors.metal};
  background: ${colors.offWhite};
  height: 36px;

  ::placeholder {
    color: ${colors.metal};
  }

  &:focus {
    color: ${colors.offBlack};
  }
`;

export default SearchBar;
