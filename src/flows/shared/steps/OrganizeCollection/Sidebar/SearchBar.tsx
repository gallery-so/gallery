import colors from 'components/core/colors';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import styled from 'styled-components';
import SearchIcon from 'assets/icons/search.svg';
import { EditModeNft } from '../types';

type Props = {
  setSearchResults: Dispatch<SetStateAction<string[]>>;
  sidebarNfts: EditModeNft[];
  setSearchQuery: Dispatch<SetStateAction<string>>;
};

function searchNftsWithQuery(editModeNfts: EditModeNft[], query: string) {
  const lowerCaseQuery = query.toLowerCase();
  // given an array of nfts and a query string, return any that match for
  // - name
  // - creator_name
  // - token_collection_name
  return editModeNfts.filter(editModeNft => {
    // conditiosn that return true for any of the match

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
  // const [searchQuery, setSearchQuery] = useState('');

  const onQueryChange = useCallback((event: any) => {
    console.log(event.target.value);
    const searchQuery = event.target.value;
    setSearchQuery(searchQuery);
    // filter sidebarnfts based on search query
    const searchResults = searchNftsWithQuery(sidebarNfts, searchQuery);
    console.log(searchResults);

    // set results with setSearchResults
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
  // background: none;
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
