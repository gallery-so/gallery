import { Route } from 'nextjs-routes';
import { graphql, useFragment } from 'react-relay';

import { GallerySearchResultFragment$key } from '~/generated/GallerySearchResultFragment.graphql';

import SearchResult from '../SearchResult';

type Props = {
  galleryRef: GallerySearchResultFragment$key;
};

export default function GallerySearchResult({ galleryRef }: Props) {
  const gallery = useFragment(
    graphql`
      fragment GallerySearchResultFragment on Gallery {
        dbid
        name
        owner {
          username
          ...SearchResultUserFragment
        }
      }
    `,
    galleryRef
  );

  const route = {
    pathname: '/[username]/galleries/[galleryId]',
    query: { username: gallery.owner?.username as string, galleryId: gallery.dbid },
  } as Route;

  return (
    <SearchResult
      name={gallery.name ?? ''}
      description={gallery?.owner?.username ?? ''}
      path={route}
      type="gallery"
      userRef={gallery.owner}
    />
  );
}
