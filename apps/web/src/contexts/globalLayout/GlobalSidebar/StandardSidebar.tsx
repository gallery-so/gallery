import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { NotificationsModal } from '~/components/NotificationsModal/NotificationsModal';
import { StandardSidebarFragment$key } from '~/generated/StandardSidebarFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import BellIcon from '~/icons/BellIcon';
import CogIcon from '~/icons/CogIcon';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import GLogoIcon from '~/icons/GLogoIcon';
import ShopIcon from '~/icons/ShopIcon';
import UserIcon from '~/icons/UserIcon';
import SettingsModal from '~/scenes/Modals/SettingsModal/SettingsModal';

import { useDrawerActions, useDrawerState } from './SidebarDrawerContext';
import SidebarIcon from './SidebarIcon';

type Props = {
  queryRef: StandardSidebarFragment$key;
};

export function StandardSidebar({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment StandardSidebarFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            user {
              username
            }
          }
        }
        ...SettingsModalFragment
      }
    `,
    queryRef
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';
  const username = query.viewer?.user?.username;

  const { showDrawer } = useDrawerActions();
  const { push } = useRouter();

  const activeDrawerState = useDrawerState();
  const activeDrawerName = useMemo(
    () => activeDrawerState.activeDrawer?.drawerName,
    [activeDrawerState]
  );

  const handleSettingsClick = useCallback(() => {
    // track('click', 'settings', 'sidebar');
    showDrawer({
      content: <SettingsModal queryRef={query} />,
      headerText: 'Settings',
      drawerName: 'settings',
    });
    // setActiveDrawer('settings');
  }, [query, showDrawer]);

  const handleNotificationsClick = useCallback(() => {
    showDrawer({
      content: <NotificationsModal fullscreen={false} />,
      headerText: 'Notifications',
      drawerName: 'notifications',
    });
  }, [showDrawer]);

  const handleProfileClick = useCallback(() => {
    push({ pathname: '/[username]', query: { username } });
  }, [push, username]);

  const handleEditClick = useCallback(() => {
    // track('click', 'settings', 'sidebar');
    push({ pathname: '/[username]/galleries', query: { username } });
  }, [push, username]);

  const handleShopIconClick = useCallback(() => {
    push({ pathname: '/shop' });
  }, [push]);

  const handleHomeIconClick = useCallback(() => {
    push({ pathname: '/trending' });
  }, [push]);

  const isMobile = useIsMobileWindowWidth();

  if (isMobile) {
    return (
      <StyledStandardSidebar>
        <StyledMobileIconContainer align="center" justify="space-around">
          <SidebarIcon tooltipLabel="Home" onClick={handleHomeIconClick} icon={<GLogoIcon />} />
          {isLoggedIn && (
            <>
              <SidebarIcon
                tooltipLabel="My Profile"
                onClick={handleProfileClick}
                icon={<UserIcon />}
              />
              <SidebarIcon
                tooltipLabel="Notifications"
                onClick={handleNotificationsClick}
                icon={<BellIcon />}
                isActive={activeDrawerName === 'notifications'}
              />
              <SidebarIcon
                tooltipLabel="Settings"
                onClick={handleSettingsClick}
                icon={<CogIcon />}
                isActive={activeDrawerName === 'settings'}
              />
            </>
          )}
        </StyledMobileIconContainer>
      </StyledStandardSidebar>
    );
  }

  return (
    <StyledStandardSidebar>
      <StyledIconContainer align="center" justify="space-between">
        <VStack gap={18}>
          <SidebarIcon tooltipLabel="Home" onClick={handleHomeIconClick} icon={<GLogoIcon />} />
          {isLoggedIn && (
            <SidebarIcon
              tooltipLabel="Edit galleries"
              onClick={handleEditClick}
              icon={<EditPencilIcon />}
            />
          )}
        </VStack>
        {/* SIDEBAR */}
        {/* <Button onClick={handleButtonClick}> Open</Button> */}
        {isLoggedIn && (
          <VStack gap={32}>
            <SidebarIcon
              tooltipLabel="My Profile"
              onClick={handleProfileClick}
              icon={<UserIcon />}
            />
            <SidebarIcon
              tooltipLabel="Notifications"
              onClick={handleNotificationsClick}
              icon={<BellIcon />}
              isActive={activeDrawerName === 'notifications'}
            />
            <SidebarIcon
              tooltipLabel="Settings"
              onClick={handleSettingsClick}
              icon={<CogIcon />}
              isActive={activeDrawerName === 'settings'}
            />
          </VStack>
        )}
        <VStack>
          <SidebarIcon
            tooltipLabel="(OBJECTS) Shop"
            onClick={handleShopIconClick}
            icon={<ShopIcon />}
          />
        </VStack>
      </StyledIconContainer>
    </StyledStandardSidebar>
  );
}

const StyledStandardSidebar = styled.div`
  min-width: 100%;
  // padding: 12px 0;
  @media only screen and ${breakpoints.tablet} {
    padding: 16px 0;
  }
`;

const StyledIconContainer = styled(VStack)`
  height: 100%;
`;

const StyledMobileIconContainer = styled(HStack)`
  height: 100%;
`;
