import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { MouseEventHandler, useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { HStack } from '~/components/core/Spacer/Stack';
import { HomeNavbarFragment$key } from '~/generated/HomeNavbarFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import isAdminRole from '~/utils/graphql/isAdminRole';

import { AuthButton } from '../AuthButton';
import { NavbarLink } from '../NavbarLink';
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
        ...isAdminRoleFragment
      }
    `,
    queryRef
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const track = useTrack();
  const handleTrendingClick = useCallback<MouseEventHandler>(() => {
    track('Home: Clicked toggle to Trending Feed');
  }, [track]);

  const handleLatestTabClick = useCallback<MouseEventHandler>(() => {
    track('Home: Clicked toggle to Latest Page');
  }, [track]);

  const handleFollowingTabClick = useCallback<MouseEventHandler>(() => {
    track('Home: Clicked toggle to Following Page');
  }, [track]);

  const handleFeaturedModeClick = useCallback<MouseEventHandler>(() => {
    track('Home: Clicked toggle to Featured Page');
  }, [track]);

  const { pathname } = useRouter();
  const curatedRoute: Route = { pathname: '/home', query: {} };
  const latestRoute: Route = { pathname: '/latest', query: {} };
  const followingRoute: Route = { pathname: '/following', query: {} };
  const exploreRoute: Route = { pathname: '/explore', query: {} };

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent />
      <NavbarCenterContent>
        <HStack gap={8}>
          <NavbarLink
            active={pathname === curatedRoute.pathname}
            to={curatedRoute}
            onClick={handleTrendingClick}
            eventElementId="Home Navbar Link"
            eventName="Home Navbar Link Click"
            eventContext={contexts.Feed}
          >
            {isLoggedIn ? 'For You' : 'Trending'}
          </NavbarLink>

          {isLoggedIn && (
            <NavbarLink
              active={pathname === followingRoute.pathname}
              to={followingRoute}
              onClick={handleFollowingTabClick}
              eventElementId="Home Navbar Link"
              eventName="Home Navbar Link Click"
              eventContext={contexts.Feed}
            >
              Following
            </NavbarLink>
          )}

          {(!isLoggedIn || isAdminRole(query)) && (
            <NavbarLink
              active={pathname === latestRoute.pathname}
              to={latestRoute}
              onClick={handleLatestTabClick}
              eventElementId="Home Navbar Link"
              eventName="Home Navbar Link Click"
              eventContext={contexts.Feed}
            >
              Latest
            </NavbarLink>
          )}

          <NavbarLink
            active={pathname === exploreRoute.pathname}
            to={exploreRoute}
            onClick={handleFeaturedModeClick}
            eventElementId="Home Navbar Link"
            eventName="Home Navbar Link Click"
            eventContext={contexts.Feed}
          >
            Explore
          </NavbarLink>
        </HStack>
      </NavbarCenterContent>

      {/* Strictly here to keep spacing consistent */}
      <NavbarRightContent>
        {isLoggedIn ? null : (
          <HStack gap={8} align="center">
            <AuthButton buttonLocation="Home Navbar" />
          </HStack>
        )}
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
