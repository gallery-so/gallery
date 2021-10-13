import colors from 'components/core/colors';
import { Dispatch, SetStateAction, useCallback } from 'react';
import styled from 'styled-components';
import SearchIcon from 'assets/icons/search.svg';
import { EditModeNft } from '../types';

type Props = {
  setSearchResults: Dispatch<SetStateAction<string[]>>;
  sidebarNfts: EditModeNft[];
  setSearchQuery: Dispatch<SetStateAction<string>>;
};

// Returns an array of NFT ids that match the given query string
function searchNftsWithQuery(editModeNfts: EditModeNft[], query: string) {
  const lowerCaseQuery = query.toLowerCase();

  return editModeNfts.filter(editModeNft => {
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
  }).map(editModeNft => editModeNft.id);
}

function SearchBar({ setSearchResults, setSearchQuery, sidebarNfts }: Props) {
  const onQueryChange = useCallback((event: any) => {
    const searchQuery = event.target.value;
    setSearchQuery(searchQuery);

    const searchResults = searchNftsWithQuery(sidebarNfts, searchQuery);
    setSearchResults(searchResults);
  }, [setSearchQuery, setSearchResults, sidebarNfts]);

  return (<StyledSearchBar>
    <StyledSearchInput
      onChange={onQueryChange}
      placeholder="Search"
    />
  </StyledSearchBar>);
}

const StyledSearchBar = styled.div`
`;

const StyledSearchInput = styled.input`
  border: 1px solid ${colors.gray30};
  width: 100%;
  padding: 8px;
  padding-left: 30px;
  color: ${colors.gray50};
  background: url(${SearchIcon}) no-repeat scroll 10px 9px;

  ::placeholder {
    color: ${colors.gray30};
  }
`;

export default SearchBar;
