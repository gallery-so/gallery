import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';

import { HStack,VStack } from '../core/Spacer/Stack';
import SearchFeaturedProfile from './SearchFeaturedProfile';
import SearchResultsHeader from './SearchResultsHeader';
import { SearchItemType } from './types';

type Props = {
  profiles: CmsTypes.FeaturedProfile[];
  variant?: 'default' | 'compact';
  onSelect: (item: SearchItemType) => void;
};

export default function SearchFeaturedCollectionSection({ profiles, variant, onSelect }: Props) {
  if (!profiles) {
    return null;
  }
  return (
    <VStack gap={8}>
      <HeaderWrapper>
        <SearchResultsHeader variant={variant}>Featured Collections</SearchResultsHeader>
      </HeaderWrapper>
      <HStack gap={4}>
        {profiles?.map((profile) => (
          <SearchFeaturedProfile onSelect={onSelect} key={profile.id} profile={profile} />
        ))}
      </HStack>
    </VStack>
  );
}

const HeaderWrapper = styled(HStack)`
  padding: 0px 12px;

  @media only screen and ${breakpoints.desktop} {
    padding-right: 12px;
    padding-left: 8px;
  }
`;
