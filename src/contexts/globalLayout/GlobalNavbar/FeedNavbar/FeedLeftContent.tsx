import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { useDropdownHoverControls } from '~/components/core/Dropdown/useDropdownHoverControls';
import { HStack } from '~/components/core/Spacer/Stack';
import { GLogo } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GLogo';
import { NotificationsCircle } from '~/contexts/globalLayout/GlobalNavbar/NotificationCircle';
import { HomeText } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { NavDownArrow } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/NavDownArrow';
import { ProfileDropdownContent } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdownContent';
import { FeedLeftContentFragment$key } from '~/generated/FeedLeftContentFragment.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import NavUpArrow from '../ProfileDropdown/NavUpArrow';

type FeedLeftContentProps = {
  queryRef: FeedLeftContentFragment$key;
};

export function FeedLeftContent({ queryRef }: FeedLeftContentProps) {
  const query = useFragment(
    graphql`
      fragment FeedLeftContentFragment on Query {
        ...ProfileDropdownContentFragment

        viewer {
          ... on Viewer {
            __typename

            notifications(last: 1) @connection(key: "FeedLeftContentFragment_notifications") {
              unseenCount
              # Relay requires that we grab the edges field if we use the connection directive
              # We're selecting __typename since that shouldn't have a cost
              edges {
                __typename
              }
            }
          }
        }

        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const notificationCount = useMemo(() => {
    if (
      query.viewer &&
      query.viewer.__typename === 'Viewer' &&
      query.viewer.notifications?.unseenCount
    ) {
      return query.viewer.notifications.unseenCount;
    }

    return 0;
  }, [query.viewer]);

  const {
    showDropdown,
    closeDropdown,
    shouldShowDropdown,
    handleDropdownMouseEnter,
    handleDropdownMouseLeave,
  } = useDropdownHoverControls();

  if (!isLoggedIn) {
    return (
      <Link href={{ pathname: '/' }}>
        <GLogoLinkWrapper href="/">
          <GLogo />
        </GLogoLinkWrapper>
      </Link>
    );
  }

  const isWhiteRhinoEnabled = isFeatureEnabled(FeatureFlag.WHITE_RHINO, query);

  const showNotifications = Boolean(isWhiteRhinoEnabled && notificationCount > 0);

  return (
    <Container gap={4} align="center" role="button">
      <HStack
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
        align="center"
      >
        <HomeText>
          {showNotifications && <StyledNotificationsCircle />}
          <span>Home</span>
        </HomeText>

        {shouldShowDropdown ? <NavUpArrow /> : <NavDownArrow />}
      </HStack>

      <ProfileDropdownContent
        shouldShowDropdown={shouldShowDropdown}
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
        onClose={closeDropdown}
        queryRef={query}
      />
    </Container>
  );
}

const StyledNotificationsCircle = styled(NotificationsCircle)`
  position: absolute;
  left: -5px;
  top: 4px;
`;

const Container = styled(HStack)`
  height: 32px;
  position: relative;
  cursor: pointer;
`;

const GLogoLinkWrapper = styled.a`
  cursor: pointer;
  text-decoration: none;
`;
