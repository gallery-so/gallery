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

export type HOME_MODE = 'ACTIVITY' | 'FEATURED';

type Props = {
  queryRef: HomeNavbarFragment$key;
  setHomeMode: (homeMode: HOME_MODE) => void;
  homeMode: HOME_MODE;
};
export function HomeNavbar({ queryRef, homeMode, setHomeMode }: Props) {
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
  const handleActivityModeClick = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();

      track('Home: Clicked toggle to Activity Feed');
      setHomeMode('ACTIVITY');
    },
    [setHomeMode, track]
  );

  const handleFeaturedModeClick = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();

      track('Home: Clicked toggle to Featured Page');
      setHomeMode('FEATURED');
    },
    [setHomeMode, track]
  );

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <ProfileDropdown queryRef={query} />
      </NavbarLeftContent>
      <NavbarCenterContent>
        <HStack gap={8}>
          <NavbarLink active={homeMode === 'ACTIVITY'} onClick={handleActivityModeClick}>
            Activity
          </NavbarLink>

          <NavbarLink active={homeMode === 'FEATURED'} onClick={handleFeaturedModeClick}>
            Featured
          </NavbarLink>
        </HStack>
      </NavbarCenterContent>

      {/* Strictly here to keep spacing consistent */}
      <NavbarRightContent>{isLoggedIn ? null : <SignInButton />}</NavbarRightContent>
    </StandardNavbarContainer>
  );
}
