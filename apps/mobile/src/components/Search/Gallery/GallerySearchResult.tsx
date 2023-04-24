import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { GallerySearchResultFragment$key } from '~/generated/GallerySearchResultFragment.graphql';
import { RootStackNavigatorProp } from '~/navigation/types';

import { SearchResult } from '../SearchResult';

type Props = {
  galleryRef: GallerySearchResultFragment$key;
};
export function GallerySearchResult({ galleryRef }: Props) {
  const gallery = useFragment(
    graphql`
      fragment GallerySearchResultFragment on Gallery {
        name
        owner {
          username
        }
      }
    `,
    galleryRef
  );

  return <SearchResult title={gallery?.name ?? ''} description={gallery?.owner?.username ?? ''} />;
}
