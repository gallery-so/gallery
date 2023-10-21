import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { GallerySearchResultFragment$key } from '~/generated/GallerySearchResultFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { SearchResult } from '../SearchResult';

type Props = {
  galleryRef: GallerySearchResultFragment$key;
  keyword: string;
};
export function GallerySearchResult({ galleryRef, keyword }: Props) {
  const gallery = useFragment(
    graphql`
      fragment GallerySearchResultFragment on Gallery {
        dbid
        name
        owner {
          username
        }
      }
    `,
    galleryRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    navigation.push('Gallery', { galleryId: gallery.dbid });
  }, [gallery.dbid, navigation]);

  return (
    <SearchResult
      onPress={handlePress}
      title={gallery?.name ?? ''}
      description={gallery?.owner?.username ?? ''}
      variant="Gallery"
      keyword={keyword}
    />
  );
}
