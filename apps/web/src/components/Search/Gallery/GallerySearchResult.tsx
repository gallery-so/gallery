import Link, { LinkProps } from 'next/link';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { BaseM } from '~/components/core/Text/Text';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { GallerySearchResultFragment$key } from '~/generated/GallerySearchResultFragment.graphql';

type Props = {
  galleryRef: GallerySearchResultFragment$key;
};

export default function GallerySearchResult({ galleryRef }: Props) {
  const gallery = useFragment(
    graphql`
      fragment GallerySearchResultFragment on Gallery {
        dbid
        name
        hidden
        owner {
          id
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
    <StyledResult href={route} onClick={hideDrawer}>
      <StyledResultTitle>{gallery.name}</StyledResultTitle>
      <BaseM>{gallery?.owner?.username}</BaseM>
    </StyledResult>
  );
}

const StyledResult = styled(Link)<LinkProps>`
  color: ${colors.offBlack};
  padding: 16px 12px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background-color: ${colors.faint};
    border-radius: 4px;
  }
`;
const StyledResultTitle = styled(BaseM)`
  font-weight: 700;
`;
