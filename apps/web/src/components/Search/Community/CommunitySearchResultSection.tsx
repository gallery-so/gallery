import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { CommunitySearchResultSectionFragment$key } from '~/generated/CommunitySearchResultSectionFragment.graphql';

import colors from '../../core/colors';
import InteractiveLink from '../../core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '../../core/Spacer/Stack';
import { TitleXS } from '../../core/Text/Text';
import { SearchFilterType } from '../Search';
import CommunitySearchResult from './CommunitySearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  queryRef: CommunitySearchResultSectionFragment$key;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export default function CommunitySearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
  queryRef,
}: Props) {
  const results = useFragment(
    graphql`
      fragment CommunitySearchResultSectionFragment on CommunitySearchResult @relay(plural: true) {
        community @required(action: THROW) {
          ...CommunitySearchResultFragment
        }
      }
    `,
    queryRef
  );

  const resultsToShow = useMemo(
    () => (isShowAll ? results : results?.slice(0, 4) ?? []),
    [results, isShowAll]
  );

  console.log('resultsToShow', resultsToShow);

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
          <CommunitySearchResult key={result.community.dbid} communityRef={result.community} />
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
