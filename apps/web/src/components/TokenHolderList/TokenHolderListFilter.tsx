import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { BaseXL } from '~/components/core/Text/Text';
import {
  useMemberListPageActions,
  useMemberListPageState,
} from '~/contexts/memberListPage/MemberListPageContext';
import colors from '~/shared/theme/colors';

function getAlphabet() {
  return [...Array(26)].map((_, i) => String.fromCharCode(65 + i));
}

type FilterButtonProps = {
  character: string;
};

function FilterButton({ character }: FilterButtonProps) {
  const { searchQuery } = useMemberListPageState();
  const { setSearchQuery } = useMemberListPageActions();

  const isSelected = useMemo(
    () => character.toLocaleLowerCase() === searchQuery.toLowerCase(),
    [character, searchQuery]
  );

  const showActiveColor = useMemo(
    () => isSelected || searchQuery.length === 0,
    [isSelected, searchQuery]
  );

  // If the we've already filtered to a character, clicking on it again clears the filter
  const handleClick = useCallback(() => {
    const searchQuery = isSelected ? '' : character;
    setSearchQuery(searchQuery);
  }, [character, isSelected, setSearchQuery]);
  return (
    <StyledFilterButton onClick={handleClick} selected={showActiveColor}>
      <StyledFilterButtonText>{character}</StyledFilterButtonText>
    </StyledFilterButton>
  );
}

type TextProps = {
  selected: boolean;
};
const StyledFilterButton = styled.button<TextProps>`
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
  width: 48px;
  height: 48px;

  color: ${(props) => (props.selected ? colors.black['800'] : colors.porcelain)};

  &:hover {
    color: ${colors.black['800']} !important;
  }

  @media only screen and ${breakpoints.tablet} {
    width: 100%;
    height: initial;
  }
`;

const StyledFilterButtonText = styled(BaseXL)`
  color: inherit;
`;

const filterCharacters = [...getAlphabet(), '#'];

function TokenHolderListFilter() {
  const { searchQuery } = useMemberListPageState();

  const hasSearchQuery = useMemo(() => searchQuery.length > 0, [searchQuery]);

  return (
    <StyledTokenHolderListFilter hasSearchQuery={hasSearchQuery}>
      {filterCharacters.map((character) => (
        <FilterButton key={character} character={character} />
      ))}
    </StyledTokenHolderListFilter>
  );
}

type StyledTokenHolderListFilterProps = {
  hasSearchQuery: boolean;
};

const StyledTokenHolderListFilter = styled.div<StyledTokenHolderListFilterProps>`
  display: grid;
  grid-template-columns: repeat(auto-fill, 48px);
  grid-gap: 0;
  justify-content: space-between;
  align-content: stretch;
  width: 97vw;
  margin-left: -16px;

  @media only screen and ${breakpoints.tablet} {
    justify-content: space-between;
    flex-wrap: nowrap;
    width: 100%;
    display: flex;
    margin-left: -12px;
  }

  @media only screen and ${breakpoints.desktop} {
    justify-content: flex-start;
  }

  ${({ hasSearchQuery }) =>
    !hasSearchQuery &&
    `&:hover {
    ${StyledFilterButton} {
      color: ${colors.porcelain};
    }
  }`}
`;

export default TokenHolderListFilter;
