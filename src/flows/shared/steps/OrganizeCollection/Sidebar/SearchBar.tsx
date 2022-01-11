import colors from 'components/core/colors';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import useDebounce from 'hooks/useDebounce';
import { EditModeNft } from '../types';

type Props = {
  setSearchResults: Dispatch<SetStateAction<string[]>>;
  sidebarNfts: EditModeNft[];
  setDebouncedSearchQuery: Dispatch<SetStateAction<string>>;
};

// Returns an array of NFT ids that match the given query string
function searchNftsWithQuery(editModeNfts: EditModeNft[], query: string) {
  const lowerCaseQuery = query.toLowerCase();

  return editModeNfts
    .filter((editModeNft) => {
      const nft = editModeNft.nft;

      if (nft.name?.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }

      // if (nft.creator_name.toLowerCase().includes(lowerCaseQuery)) {
      //   return true;
      // }

      if (nft.token_collection_name?.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }

      return false;
    })
    .map((editModeNft) => editModeNft.id);
}

function SearchBar({ setSearchResults, setDebouncedSearchQuery, sidebarNfts }: Props) {
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
    const searchResults = searchNftsWithQuery(sidebarNfts, debouncedSearchQuery);
    setDebouncedSearchQuery(debouncedSearchQuery);
    setSearchResults(searchResults);
  }, [debouncedSearchQuery, setDebouncedSearchQuery, setSearchResults, sidebarNfts]);

  return (
    <StyledSearchBar>
      <StyledSearchInput onChange={handleQueryChange} placeholder="Search" />
    </StyledSearchBar>
  );
}

const StyledSearchBar = styled.div``;

const StyledSearchInput = styled.input`
  border: 1px solid ${colors.gray30};
  width: 100%;
  padding: 8px;
  padding-left: 30px;
  color: ${colors.gray50};
  background: url(/icons/search.svg) no-repeat scroll 10px 9px;

  ::placeholder {
    color: ${colors.gray30};
  }
`;

export default SearchBar;
