import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';
import { MouseEventHandler, useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { HStack } from '~/components/core/Spacer/Stack';
import { HomeNavbarFragment$key } from '~/generated/HomeNavbarFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

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
      }
    `,
    queryRef
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const track = useTrack();
  const handleTrendingClick = useCallback<MouseEventHandler>(() => {
    track('Home: Clicked toggle to Trending Feed');
  }, [track]);

  const handleLatestModeClick = useCallback<MouseEventHandler>(() => {
    track('Home: Clicked toggle to Latest Page');
  }, [track]);

  const handleFeaturedModeClick = useCallback<MouseEventHandler>(() => {
    track('Home: Clicked toggle to Featured Page');
  }, [track]);

  const { pathname } = useRouter();
  const curatedRoute: Route = { pathname: '/home', query: {} };
  const latestRoute: Route = { pathname: '/latest', query: {} };
  const latestFollowingRoute: Route = { pathname: '/latest/following', query: {} };
  const exploreRoute: Route = { pathname: '/explore', query: {} };

  const isMobile = useIsMobileWindowWidth();

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent />
      <NavbarCenterContent>
        <HStack gap={8}>
          <NavbarLink
            active={pathname === curatedRoute.pathname}
            // @ts-expect-error We're not using the legacy Link
            href={route(curatedRoute)}
            onClick={handleTrendingClick}
          >
            Curated
          </NavbarLink>

          <NavbarLink
            active={pathname === latestRoute.pathname || pathname === latestFollowingRoute.pathname}
            // @ts-expect-error We're not using the legacy Link
            href={route(latestRoute)}
            onClick={handleLatestModeClick}
          >
            Latest
          </NavbarLink>

          <NavbarLink
            active={pathname === exploreRoute.pathname}
            // @ts-expect-error We're not using the legacy Link
            href={route(exploreRoute)}
            onClick={handleFeaturedModeClick}
          >
            Explore
          </NavbarLink>
        </HStack>
      </NavbarCenterContent>

      {/* Strictly here to keep spacing consistent */}
      <NavbarRightContent>
        {isLoggedIn ? null : (
          <HStack gap={8} align="center">
            <SignInButton />
            {/* Don't show Sign Up btn on mobile bc it doesnt fit alongside Sign In, and onboarding isn't mobile optimized yet */}
            {!isMobile && <SignUpButton />}
          </HStack>
        )}
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
