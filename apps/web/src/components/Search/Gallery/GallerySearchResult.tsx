import { Route } from 'nextjs-routes';
import { graphql, useFragment } from 'react-relay';

import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
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
          ...ProfilePictureFragment
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
      profilePicture={gallery.owner && <ProfilePicture userRef={gallery.owner} size="md" />}
    />
  );
}
