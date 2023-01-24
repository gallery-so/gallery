import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';
import { MouseEventHandler, useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { HStack } from '~/components/core/Spacer/Stack';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { HomeNavbarFragment$key } from '~/generated/HomeNavbarFragment.graphql';

import { NavbarLink } from '../NavbarLink';
import { ProfileDropdown } from '../ProfileDropdown/ProfileDropdown';
import { SignInButton } from '../SignInButton';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '../StandardNavbarContainer';

type Props = {
  queryRef: HomeNavbarFragment$key;
};
export function HomeNavbar({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment HomeNavbarFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }

        ...ProfileDropdownFragment
      }
    `,
    queryRef
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const track = useTrack();
  const handleActivityModeClick = useCallback<MouseEventHandler>(() => {
    track('Home: Clicked toggle to Activity Feed');
  }, [track]);

  const handleFeaturedModeClick = useCallback<MouseEventHandler>(() => {
    track('Home: Clicked toggle to Featured Page');
  }, [track]);

  const { pathname } = useRouter();
  const activityRoute: Route = { pathname: '/activity', query: {} };
  const featuredRoute: Route = { pathname: '/featured', query: {} };

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <ProfileDropdown queryRef={query} />
      </NavbarLeftContent>
      <NavbarCenterContent>
        <HStack gap={8}>
          <NavbarLink
            active={pathname === activityRoute.pathname}
            href={route(activityRoute)}
            onClick={handleActivityModeClick}
          >
            Activity
          </NavbarLink>

          <NavbarLink
            active={pathname === featuredRoute.pathname}
            href={route(featuredRoute)}
            onClick={handleFeaturedModeClick}
          >
            Featured
          </NavbarLink>
        </HStack>
      </NavbarCenterContent>

      {/* Strictly here to keep spacing consistent */}
      <NavbarRightContent>{isLoggedIn ? null : <SignInButton />}</NavbarRightContent>
    </StandardNavbarContainer>
  );
}
