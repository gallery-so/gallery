import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { UserSearchResultSectionFragment$key } from '~/generated/UserSearchResultSectionFragment.graphql';

import colors from '../../core/colors';
import InteractiveLink from '../../core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '../../core/Spacer/Stack';
import { TitleXS } from '../../core/Text/Text';
import { SearchFilterType } from '../Search';
import UserSearchResult from './UserSearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  queryRef: UserSearchResultSectionFragment$key;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export default function UserSearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
  queryRef,
}: Props) {
  const results = useFragment(
    graphql`
      fragment UserSearchResultSectionFragment on UserSearchResult @relay(plural: true) {
        user @required(action: THROW) {
          id
          ...UserSearchResultFragment
        }
      }
    `,
    queryRef
  );

  const resultsToShow = useMemo(
    () => (isShowAll ? results : results?.slice(0, 4) ?? []),
    [results, isShowAll]
  );

  return (
    <VStack gap={10}>
      <StyledResultHeader align="center" justify="space-between">
        <StyledTitle>{title}</StyledTitle>

        {!isShowAll && (
          <StyledInteractiveLink onClick={() => onChangeFilter('curator')}>
            Show all
          </StyledInteractiveLink>
        )}
      </StyledResultHeader>

      <VStack>
        {resultsToShow.map((result) => (
          <UserSearchResult key={result.user.id} userRef={result.user} />
        ))}
      </VStack>
    </VStack>
  );
}

const StyledTitle = styled(TitleXS)`
  text-transform: uppercase;
`;

const StyledResultHeader = styled(HStack)`
  padding: 0 12px;
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  color: ${colors.offBlack};
`;
