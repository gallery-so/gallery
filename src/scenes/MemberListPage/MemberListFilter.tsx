import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Heading } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import breakpoints from 'components/core/breakpoints';
import { useMemberListPageActions, useMemberListPageState } from 'contexts/memberListPage/MemberListPageContext';

function getAlphabet() {
  return [...Array(26)].map((_, i) => String.fromCharCode(65 + i));
}

type FilterButtonProps = {
  character: string;
};

function FilterButton({ character }: FilterButtonProps) {
  const { searchQuery } = useMemberListPageState();
  const { setSearchQuery }= useMemberListPageActions()

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

const filterCharacters = [...getAlphabet(), '#'];

function MemberListFilter() {
  const { searchQuery } = useMemberListPageState();

  const hasSearchQuery = useMemo(() => searchQuery.length > 0, [searchQuery]);

  return (
    <StyledMemberListFilter hasSearchQuery={hasSearchQuery}>
      {filterCharacters.map((character) => (
        <FilterButton
          key={character}
          character={character}
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
  margin-left: -28px;

  @media only screen and ${breakpoints.tablet} {
    justify-content: space-between;
    flex-wrap: nowrap;
    margin-left: -16px;
  }

  @media only screen and ${breakpoints.desktop} {
    margin-left: -28px;
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
