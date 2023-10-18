import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack } from '~/components/core/Spacer/Stack';
import {
  BreadcrumbLink,
  BreadcrumbText,
} from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { GalleryTitleBreadcrumbFragment$key } from '~/generated/GalleryTitleBreadcrumbFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';

type Props = {
  username: string;
  galleryRef: GalleryTitleBreadcrumbFragment$key;
};

export default function GalleryTitleBreadcrumb({ username, galleryRef }: Props) {
  const gallery = useFragment(
    graphql`
      fragment GalleryTitleBreadcrumbFragment on Gallery {
        dbid
        name
      }
    `,
    galleryRef
  );

  const { pathname } = useRouter();
  const userGalleryRoute: Route = useMemo(
    () => ({ pathname: '/[username]', query: { username } }),
    [username]
  );

  const galleryRoute: Route = {
    pathname: '/[username]/galleries/[galleryId]',
    query: { username, galleryId: gallery.dbid },
  };

  const isHome = userGalleryRoute.pathname === pathname;

  return (
    <HStack>
      {!isHome && (
        <>
          <GalleryLink
            to={userGalleryRoute}
            eventElementId="Username Link"
            eventName="Username Link Click"
            eventContext={contexts.UserGallery}
          >
            <StyledBreadcrumbLink isActive={false}>{username}</StyledBreadcrumbLink>
          </GalleryLink>
          <StyledBreadcrumbText>&nbsp;/</StyledBreadcrumbText>
        </>
      )}

      {gallery.name && (
        <GalleryLink
          to={galleryRoute}
          eventElementId="Gallery Name Link"
          eventName="Gallery Name Link Click"
          eventContext={contexts.UserGallery}
        >
          <StyledBreadcrumbLink isActive={pathname === galleryRoute.pathname || isHome}>
            {gallery.name}
          </StyledBreadcrumbLink>
        </GalleryLink>
      )}
    </HStack>
  );
}

const StyledBreadcrumbLink = styled(BreadcrumbLink)<{ isActive: boolean }>`
  color: ${({ isActive }) => (isActive ? colors.black['800'] : colors.metal)};
  font-size: 20px;
  line-height: 28px;
`;

const StyledBreadcrumbText = styled(BreadcrumbText)`
  font-size: 20px;
  line-height: 28px;
`;
