import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { GallerySearchResultFragment$key } from '~/generated/GallerySearchResultFragment.graphql';

import SearchResult from '../SearchResult';
import { SearchItemType } from '../types';

type Props = {
  keyword: string;
  galleryRef: GallerySearchResultFragment$key;
  onSelect: (item: SearchItemType) => void;
};

export default function GallerySearchResult({ keyword, galleryRef, onSelect }: Props) {
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

  const route = useMemo(() => {
    return {
      type: 'Gallery' as const,
      label: gallery.name ?? '',
      value: gallery.dbid,
      owner: gallery.owner?.username as string,
    };
  }, [gallery.name, gallery.dbid, gallery.owner?.username]);

  const handleClick = useCallback(() => {
    onSelect(route);
  }, [onSelect, route]);

  return (
    <SearchResult
      name={gallery.name ?? ''}
      description={gallery?.owner?.username ?? ''}
      profilePicture={gallery.owner && <ProfilePicture userRef={gallery.owner} size="md" />}
      onClick={handleClick}
      keyword={keyword}
      route={JSON.stringify(route)}
    />
  );
}
