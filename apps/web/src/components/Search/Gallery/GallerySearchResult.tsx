import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { GallerySearchResultFragment$key } from '~/generated/GallerySearchResultFragment.graphql';

import SearchResult from '../SearchResult';

type Props = {
  keyword: string;
  galleryRef: GallerySearchResultFragment$key;
  onClose?: () => void;
};

export default function GallerySearchResult({ keyword, galleryRef, onClose }: Props) {
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

  const router = useRouter();

  const route = useMemo<Route>(() => {
    return {
      pathname: '/[username]/galleries/[galleryId]',
      query: { username: gallery.owner?.username as string, galleryId: gallery.dbid },
    };
  }, [gallery.dbid, gallery.owner?.username]);

  const handleClick = useCallback(() => {
    router.push(route);
    onClose?.();
  }, [onClose, route, router]);

  return (
    <SearchResult
      name={gallery.name ?? ''}
      description={gallery?.owner?.username ?? ''}
      path={route}
      type="gallery"
      profilePicture={gallery.owner && <ProfilePicture userRef={gallery.owner} size="md" />}
      onClick={handleClick}
      keyword={keyword}
    />
  );
}
