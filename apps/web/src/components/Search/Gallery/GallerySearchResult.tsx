import { useCallback } from 'react';
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

  const handleClick = useCallback(() => {
    onSelect({
      type: 'Gallery',
      label: gallery.name ?? '',
      value: gallery.dbid,
      owner: gallery.owner?.username as string,
    });
  }, [gallery.dbid, gallery.name, gallery.owner?.username, onSelect]);

  return (
    <SearchResult
      name={gallery.name ?? ''}
      description={gallery?.owner?.username ?? ''}
      profilePicture={gallery.owner && <ProfilePicture userRef={gallery.owner} size="md" />}
      onClick={handleClick}
      keyword={keyword}
    />
  );
}
