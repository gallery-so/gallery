import { graphql, useFragment } from 'react-relay';

import { BaseM } from '~/components/core/Text/Text';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { GallerySearchResultFragment$key } from '~/generated/GallerySearchResultFragment.graphql';

import { StyledSearchResult, StyledSearchResultTitle } from '../SearchStyles';

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
        }
      }
    `,
    galleryRef
  );

  const { hideDrawer } = useDrawerActions();

  const route = {
    pathname: '/[username]/galleries/[galleryId]',
    query: { username: gallery.owner?.username as string, galleryId: gallery.dbid },
  };

  return (
    <StyledSearchResult href={route} onClick={hideDrawer}>
      <StyledSearchResultTitle>{gallery.name}</StyledSearchResultTitle>
      <BaseM>{gallery?.owner?.username}</BaseM>
    </StyledSearchResult>
  );
}
