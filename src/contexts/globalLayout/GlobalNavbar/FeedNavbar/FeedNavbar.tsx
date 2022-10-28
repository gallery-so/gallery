import { MouseEventHandler, useCallback } from 'react';

import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { FeedNavbarFragment$key } from '__generated__/FeedNavbarFragment.graphql';
import { FeedMode } from 'components/Feed/Feed';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { HStack } from 'components/core/Spacer/Stack';
import { NavbarLink } from 'contexts/globalLayout/GlobalNavbar/NavbarLink';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { FeedLeftContent } from 'contexts/globalLayout/GlobalNavbar/FeedNavbar/FeedLeftContent';
import { SignInButton } from 'contexts/globalLayout/GlobalNavbar/SignInButton';

type FeedNavbarProps = {
  queryRef: FeedNavbarFragment$key;
  feedMode: FeedMode;
  onChange: (mode: FeedMode) => void;
};

export function FeedNavbar({ queryRef, onChange, feedMode }: FeedNavbarProps) {
  const query = useFragment(
    graphql`
      fragment FeedNavbarFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }

        ...FeedLeftContentFragment
      }
    `,
    queryRef
  );

  const track = useTrack();
  const handleFollowingModeClick = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();

      track('Feed: Clicked toggle to Following feed');
      onChange('FOLLOWING');
    },
    [onChange, track]
  );

  const handleWorldwideModeClick = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();

      track('Feed: Clicked toggle to Worldwide feed');
      onChange('WORLDWIDE');
    },
    [onChange, track]
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <FeedLeftContent queryRef={query} />
      </NavbarLeftContent>

      <NavbarCenterContent>
        {query.viewer?.__typename ? (
          <HStack gap={8}>
            <NavbarLink active={feedMode === 'FOLLOWING'} onClick={handleFollowingModeClick}>
              Following
            </NavbarLink>

            <NavbarLink active={feedMode === 'WORLDWIDE'} onClick={handleWorldwideModeClick}>
              Worldwide
            </NavbarLink>
          </HStack>
        ) : null}
      </NavbarCenterContent>

      {/* Strictly here to keep spacing consistent */}
      <NavbarRightContent>{isLoggedIn ? null : <SignInButton />}</NavbarRightContent>
    </StandardNavbarContainer>
  );
}
