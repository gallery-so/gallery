import styled from 'styled-components';

import { FeaturedListFragment$key } from '~/generated/FeaturedListFragment.graphql';
import { FeaturedUserCardFollowFragment$key } from '~/generated/FeaturedUserCardFollowFragment.graphql';

import colors from '../core/colors';
import { VStack } from '../core/Spacer/Stack';
import { TitleDiatypeL } from '../core/Text/Text';
import FeaturedList from './FeaturedList';

type Props = {
  title: string;
  subTitle: string;
  trendingUsersRef: FeaturedListFragment$key;
  queryRef: FeaturedUserCardFollowFragment$key;
};

export default function FeaturedSection({ trendingUsersRef, queryRef, title, subTitle }: Props) {
  return (
    <StyledFeaturedSection gap={32}>
      <VStack gap={4}>
        <Title>{title}</Title>
        <TitleDiatypeL color={colors.metal}>{subTitle}</TitleDiatypeL>
      </VStack>
      <FeaturedList trendingUsersRef={trendingUsersRef} queryRef={queryRef} />
    </StyledFeaturedSection>
  );
}

const StyledFeaturedSection = styled(VStack)`
  width: 100%;
`;

const Title = styled(TitleDiatypeL)`
  font-size: 24px;
`;
