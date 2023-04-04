import { graphql, useFragment } from 'react-relay';

import { GallerySearchResultFragment$key } from '~/generated/GallerySearchResultFragment.graphql';

import { SearchResult } from '../SearchResult';

type Props = {
  galleryRef: GallerySearchResultFragment$key;
};
export function GallerySearchResult({ galleryRef }: Props) {
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

  return <SearchResult title={gallery?.name ?? ''} description={gallery?.owner?.username ?? ''} />;
}
