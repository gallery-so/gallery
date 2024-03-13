import Skeleton from 'react-loading-skeleton';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { TrendingSectionFragment$key } from '~/generated/TrendingSectionFragment.graphql';
import { TrendingSectionQueryFragment$key } from '~/generated/TrendingSectionQueryFragment.graphql';
import colors from '~/shared/theme/colors';

import breakpoints from '../core/breakpoints';
import { VStack } from '../core/Spacer/Stack';
import { TitleDiatypeL } from '../core/Text/Text';
import ExploreList from './ExploreList';

type Props = {
  title: string;
  subTitle: string;
  trendingUsersRef: TrendingSectionFragment$key;
  queryRef: TrendingSectionQueryFragment$key;
};

export default function TrendingSection({ trendingUsersRef, queryRef, title, subTitle }: Props) {
  const query = useFragment(
    graphql`
      fragment TrendingSectionQueryFragment on Query {
        ...ExploreListQueryFragment
      }
    `,
    queryRef
  );

  const trendingUsers = useFragment(
    graphql`
      fragment TrendingSectionFragment on TrendingUsersPayload {
        users {
          ...ExploreListFragment
        }
      }
    `,
    trendingUsersRef
  );

  return (
    <StyledTrendingSection gap={32}>
      <VStack gap={4}>
        <Title>{title}</Title>
        <TitleDiatypeL color={colors.metal}>{subTitle}</TitleDiatypeL>
      </VStack>
      <ExploreList exploreUsersRef={trendingUsers.users || []} queryRef={query} />
    </StyledTrendingSection>
  );
}

export function TrendingSectionLoadingState({
  title,
  subTitle,
}: {
  title: string;
  subTitle: string;
}) {
  return (
    <StyledTrendingSection gap={32}>
      <VStack gap={4}>
        <Title>{title}</Title>
        <TitleDiatypeL color={colors.metal}>{subTitle}</TitleDiatypeL>
      </VStack>
      <StyledCardContainer>
        {[...Array(4)].map((_, index) => (
          <UserCardPlaceholder key={index}>
            <Skeleton height={'100%'} />
          </UserCardPlaceholder>
        ))}
      </StyledCardContainer>
    </StyledTrendingSection>
  );
}

const StyledTrendingSection = styled(VStack)`
  width: 100%;
`;

const Title = styled(TitleDiatypeL)`
  font-size: 24px;
`;

const StyledCardContainer = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0px, 1fr));
  grid-template-rows: repeat(2, minmax(0px, 1fr));

  @media only screen and (${breakpoints.tablet}) {
    grid-template-columns: repeat(4, minmax(0px, 1fr));
    grid-template-rows: repeat(1, minmax(0px, 1fr));
  }
`;

const UserCardPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  aspect-ratio: 1.5;
`;
