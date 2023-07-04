import { Route } from 'nextjs-routes';
import { graphql, useFragment } from 'react-relay';

import { GallerySearchResultFragment$key } from '~/generated/GallerySearchResultFragment.graphql';
import { GallerySearchResultQueryFragment$key } from '~/generated/GallerySearchResultQueryFragment.graphql';

import SearchResult from '../SearchResult';

type Props = {
  galleryRef: GallerySearchResultFragment$key;
  queryRef: GallerySearchResultQueryFragment$key;
};

export default function GallerySearchResult({ galleryRef, queryRef }: Props) {
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

  const query = useFragment(
    graphql`
      fragment GallerySearchResultQueryFragment on Query {
        ...SearchResultQueryFragment
      }
    `,
    queryRef
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
      queryRef={query}
    />
  );
}
