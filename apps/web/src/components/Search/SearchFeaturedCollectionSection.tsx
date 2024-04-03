import { CmsTypes } from '~/scenes/ContentPages/cms_types';

import { VStack, HStack } from '../core/Spacer/Stack';
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
      <SearchResultsHeader variant={variant}>Featured Collections</SearchResultsHeader>
      <HStack justify="space-between" style={{ paddingBottom: '12px' }}>
        {profiles?.map((profile) => (
          <SearchFeaturedProfile onSelect={onSelect} key={profile.id} profile={profile} />
        ))}
      </HStack>
    </VStack>
  );
}
