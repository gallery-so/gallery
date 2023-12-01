import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { MouseEventHandler, useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { HStack } from '~/components/core/Spacer/Stack';
import SnowToggleIcon from '~/contexts/snow/SnowToggleIcon';
import { HomeNavbarFragment$key } from '~/generated/HomeNavbarFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import isAdminRole from '~/utils/graphql/isAdminRole';

import { NavbarLink } from '../NavbarLink';
import { SignInButton } from '../SignInButton';
import { SignUpButton } from '../SignUpButton';
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

  const isMobile = useIsMobileWindowWidth();

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
        {isLoggedIn ? (
          <SnowToggleIcon />
        ) : (
          <HStack gap={8} align="center">
            <SnowToggleIcon />
            <SignInButton />
            {/* Don't show Sign Up btn on mobile bc it doesnt fit alongside Sign In, and onboarding isn't mobile optimized yet */}
            {!isMobile && <SignUpButton />}
          </HStack>
        )}
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
