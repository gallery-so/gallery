import { CmsTypes } from '~/scenes/ContentPages/cms_types';

import { VStack, HStack } from '../core/Spacer/Stack';
import SearchFeaturedProfile from './SearchFeaturedProfile';
import SearchResultsHeader from './SearchResultsHeader';

type Props = {
  profiles: CmsTypes.FeaturedProfile[];
  variant?: 'default' | 'compact';
};

export default function SearchFeaturedCollectionSection({ profiles, variant }: Props) {
  return (
    <VStack gap={8}>
      <SearchResultsHeader variant={variant}>Featured Collections</SearchResultsHeader>
      <HStack justify="space-between" style={{ paddingBottom: '12px' }}>
        {profiles?.map((profile) => (
          <SearchFeaturedProfile key={profile.id} profile={profile} />
        ))}
      </HStack>
    </VStack>
  );
}
