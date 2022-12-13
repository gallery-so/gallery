import { useRouter } from 'next/router';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { Paragraph, TITLE_FONT_FAMILY } from '~/components/core/Text/Text';
import { GLogo } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GLogo';
import { NavDownArrow } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/NavDownArrow';
import { ProfileDropdownContent } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdownContent';
import { ProfileDropdownFragment$key } from '~/generated/ProfileDropdownFragment.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import { NotificationsCircle } from '../NotificationCircle';
import NavUpArrow from './NavUpArrow';

type ProfileDropdownProps = {
  queryRef: ProfileDropdownFragment$key;
  rightContent?: ReactNode;
};

export function ProfileDropdown({ queryRef, rightContent }: ProfileDropdownProps) {
  const query = useFragment(
    graphql`
      fragment ProfileDropdownFragment on Query {
        viewer {
          ... on Viewer {
            __typename

            notifications(last: 1) @connection(key: "ProfileDropdownFragment_notifications") {
              unseenCount
              # Relay requires that we grab the edges field if we use the connection directive
              # We're selecting __typename since that shouldn't have a cost
              # eslint-disable-next-line relay/unused-fields
              edges {
                __typename
              }
            }
          }
        }

        ...isFeatureEnabledFragment
        ...ProfileDropdownContentFragment
      }
    `,
    queryRef
  );

  const [showDropdown, setShowDropdown] = useState(false);

  const { push, pathname, query: urlQuery } = useRouter();

  const handleLoggedInLogoClick = useCallback(() => {
    setShowDropdown((previous) => !previous);
  }, []);

  const handleLoggedOutLogoClick = useCallback(() => {
    push({ pathname: '/home' });
  }, [push]);

  const handleClose = useCallback(() => {
    setShowDropdown(false);
  }, []);

  useEffect(
    function closeDropdownWhenRouteChanges() {
      handleClose();
    },
    [handleClose, pathname, urlQuery]
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

  const isWhiteRhinoEnabled = isFeatureEnabled(FeatureFlag.WHITE_RHINO, query);

  return (
    <Wrapper gap={4} align="center">
      {isLoggedIn ? (
        <LogoContainer gap={4} role="button" onClick={handleLoggedInLogoClick}>
          {isWhiteRhinoEnabled && notificationCount > 0 ? <StyledNotificationsCircle /> : null}

          <HStack gap={2} align="center">
            <GLogo />

            {showDropdown ? <NavUpArrow /> : <NavDownArrow />}
          </HStack>
        </LogoContainer>
      ) : (
        <LogoContainer gap={4} role="button" onClick={handleLoggedOutLogoClick} align="center">
          <GLogo />
        </LogoContainer>
      )}

      {rightContent && <SlashText>/</SlashText>}
      {rightContent}

      {isLoggedIn && (
        <ProfileDropdownContent
          showDropdown={showDropdown}
          onClose={handleClose}
          queryRef={query}
        />
      )}
    </Wrapper>
  );
}

const LogoContainer = styled(HStack)`
  min-height: 32px;
  cursor: pointer;
  position: relative;

  // This weird bit of code your seeing is to keep the spacing around
  // this component the same, but ensure the tap target is bigger.
  margin: -16px -8px;
  padding: 16px 8px;
`;

const StyledNotificationsCircle = styled(NotificationsCircle)`
  position: absolute;
  left: 0;
  top: 16px;
`;

const Wrapper = styled(HStack)`
  position: relative;
  max-width: 100%;
`;

export const SlashText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 18px;
  font-weight: 300;
  line-height: 21px;
`;
