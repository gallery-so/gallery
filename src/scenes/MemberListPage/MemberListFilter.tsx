import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Heading } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import breakpoints from 'components/core/breakpoints';

function getAlphabet() {
  return [...Array(26)].map((_, i) => String.fromCharCode(65 + i));
}

type FilterButtonProps = {
  character: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  searchQuery: string;
};

function FilterButton({ character, setSearchQuery, searchQuery }: FilterButtonProps) {
  const isSelected = useMemo(
    () => character.toLocaleLowerCase() === searchQuery.toLowerCase(),
    [character, searchQuery]
  );

  const showActiveColor = useMemo(
    () => isSelected || searchQuery.length === 0,
    [isSelected, searchQuery]
  );

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

  color: ${(props) => (props.selected ? colors.black : colors.gray20)};

  &:hover {
    color: ${colors.black} !important;
  }

  @media only screen and ${breakpoints.tablet} {
    width: 100%;
    height: initial;
  }
`;

const StyledFilterButtonText = styled(Heading)`
  color: inherit;
`;

type Props = {
  setSearchQuery: Dispatch<SetStateAction<string>>;
  searchQuery: string;
};

function MemberListFilter({ setSearchQuery, searchQuery }: Props) {
  const filterCharacters = useMemo(() => {
    const alphabet = getAlphabet();
    alphabet.push('#');
    return alphabet;
  }, []);
  const hasSearchQuery = useMemo(() => searchQuery.length > 0, [searchQuery]);

  return (
    <StyledMemberListFilter hasSearchQuery={hasSearchQuery}>
      {filterCharacters.map((character) => (
        <FilterButton
          key={character}
          character={character}
          setSearchQuery={setSearchQuery}
          searchQuery={searchQuery}
        />
      ))}
    </StyledMemberListFilter>
  );
}

type StyledMemberListFilterProps = {
  hasSearchQuery: boolean;
};

const StyledMemberListFilter = styled.div<StyledMemberListFilterProps>`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: stretch;

  @media only screen and ${breakpoints.tablet} {
    justify-content: space-between;
    flex-wrap: nowrap;
  }

  ${({ hasSearchQuery }) =>
    !hasSearchQuery &&
    `&:hover {
    ${StyledFilterButton} {
      color: ${colors.gray30};
    }
  }`}
`;

export default MemberListFilter;
