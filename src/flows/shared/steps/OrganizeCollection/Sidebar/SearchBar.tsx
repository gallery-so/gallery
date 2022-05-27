import colors from 'components/core/colors';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import useDebounce from 'hooks/useDebounce';
import { graphql, useFragment } from 'react-relay';
import { SearchBarFragment$key } from '__generated__/SearchBarFragment.graphql';

type Props = {
  nftsRef: SearchBarFragment$key;
  setSearchResults: Dispatch<SetStateAction<string[]>>;
  setDebouncedSearchQuery: Dispatch<SetStateAction<string>>;
};

function SearchBar({ nftsRef, setSearchResults, setDebouncedSearchQuery }: Props) {
  const nfts = useFragment(
    graphql`
      fragment SearchBarFragment on Nft @relay(plural: true) {
        dbid
        name
        openseaCollectionName
      }
    `,
    nftsRef
  );

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  const handleQueryChange = useCallback(
    (event: any) => {
      const searchQuery = event.target.value;
      setSearchQuery(searchQuery);
    },
    [setSearchQuery]
  );

  useEffect(() => {
    const lowerCaseQuery = debouncedSearchQuery.toLowerCase();

    const searchResults = nfts
      .filter((nft) => {
        if (nft.name?.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }

        if (nft.openseaCollectionName?.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }

        return false;
      })
      .map((nft) => nft.dbid);

    setDebouncedSearchQuery(debouncedSearchQuery);
    setSearchResults(searchResults);
  }, [debouncedSearchQuery, setDebouncedSearchQuery, setSearchResults, nfts]);

  return (
    <StyledSearchBar>
      <StyledSearchInput onChange={handleQueryChange} placeholder="Search" />
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
`;

export default SearchBar;
