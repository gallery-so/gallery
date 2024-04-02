import { CmsTypes } from '~/scenes/ContentPages/cms_types';

import { HStack } from '../core/Spacer/Stack';
import SearchFeaturedProfile from './SearchFeaturedProfile';
import SearchResultsHeader from './SearchResultsHeader';

type Props = {
  profiles: CmsTypes.FeaturedProfile[];
  variant?: 'default' | 'compact';
};

export default function SearchFeaturedCollectionSection({ profiles, variant }: Props) {
  return (
    <>
      <SearchResultsHeader variant={variant}>Featured Collections</SearchResultsHeader>
      <HStack justify="space-between" style={{ paddingBottom: '12px' }}>
        {profiles?.map((profile) => (
          <SearchFeaturedProfile key={profile.id} profile={profile} />
        ))}
      </HStack>
    </>
  );
}
