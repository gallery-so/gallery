import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { FeaturedSectionFragment$key } from '~/generated/FeaturedSectionFragment.graphql';
import { FeaturedSectionQueryFragment$key } from '~/generated/FeaturedSectionQueryFragment.graphql';

import colors from '../core/colors';
import { VStack } from '../core/Spacer/Stack';
import { TitleDiatypeL } from '../core/Text/Text';
import FeaturedList from './FeaturedList';

type Props = {
  title: string;
  subTitle: string;
  trendingUsersRef: FeaturedSectionFragment$key;
  queryRef: FeaturedSectionQueryFragment$key;
};

export default function FeaturedSection({ trendingUsersRef, queryRef, title, subTitle }: Props) {
  const query = useFragment(
    graphql`
      fragment FeaturedSectionQueryFragment on Query {
        ...FeaturedListQueryFragment
      }
    `,
    queryRef
  );

  const trendingUsers = useFragment(
    graphql`
      fragment FeaturedSectionFragment on TrendingUsersPayload {
        users {
          ...FeaturedListFragment
        }
      }
    `,
    trendingUsersRef
  );

  return (
    <StyledFeaturedSection gap={32}>
      <VStack gap={4}>
        <Title>{title}</Title>
        <TitleDiatypeL color={colors.metal}>{subTitle}</TitleDiatypeL>
      </VStack>
      <FeaturedList trendingUsersRef={trendingUsers.users || []} queryRef={query} />
    </StyledFeaturedSection>
  );
}

const StyledFeaturedSection = styled(VStack)`
  width: 100%;
`;

const Title = styled(TitleDiatypeL)`
  font-size: 24px;
`;
