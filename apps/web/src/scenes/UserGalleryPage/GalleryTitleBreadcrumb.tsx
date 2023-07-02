import Link from 'next/link';
import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import {
  BreadcrumbLink,
  BreadcrumbText,
} from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { GalleryTitleBreadcrumbFragment$key } from '~/generated/GalleryTitleBreadcrumbFragment.graphql';
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
          <Link href={userGalleryRoute} legacyBehavior>
            <StyledBreadcrumbLink href={route(userGalleryRoute)} isActive={false}>
              {username}
            </StyledBreadcrumbLink>
          </Link>
          <StyledBreadcrumbText>&nbsp;/</StyledBreadcrumbText>
        </>
      )}

      {gallery.name && (
        <Link href={galleryRoute} legacyBehavior>
          <StyledBreadcrumbLink
            href={route(galleryRoute)}
            isActive={pathname === galleryRoute.pathname || isHome}
          >
            {gallery.name}
          </StyledBreadcrumbLink>
        </Link>
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
