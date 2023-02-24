import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import IconContainer from '~/components/core/IconContainer';
import { VStack } from '~/components/core/Spacer/Stack';
import { NotificationsModal } from '~/components/NotificationsModal/NotificationsModal';
import { StandardSidebarFragment$key } from '~/generated/StandardSidebarFragment.graphql';
import AlertIcon from '~/icons/AlertIcon';
import BellIcon from '~/icons/BellIcon';
import CogIcon from '~/icons/CogIcon';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import ShopIcon from '~/icons/ShopIcon';
import UserIcon from '~/icons/UserIcon';
import SettingsModal from '~/scenes/Modals/SettingsModal/SettingsModal';

import { useDrawerActions } from './SidebarDrawerContext';
import SidebarIcon from './SidebarIcon';

type Props = {
  queryRef: StandardSidebarFragment$key;
};

type DrawerType = 'settings' | 'notifications';

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

  const [activeDrawer, setActiveDrawer] = useState<DrawerType | null>(null);

  const { showDrawer } = useDrawerActions();
  const { push } = useRouter();

  const handleSettingsClick = useCallback(() => {
    // track('click', 'settings', 'sidebar');
    showDrawer({
      content: <SettingsModal queryRef={query} />,
      headerText: 'Settings',
    });
    setActiveDrawer('settings');
  }, [query, showDrawer]);

  const handleNotificationsClick = useCallback(() => {
    showDrawer({
      content: <NotificationsModal fullscreen={false} />,
      headerText: 'Notifications',
    });
    setActiveDrawer('notifications');
  }, []);

  const handleProfileClick = useCallback(() => {
    push({ pathname: '/[username]', query: { username } });
  }, []);

  const handleEditClick = useCallback(() => {
    // track('click', 'settings', 'sidebar');
    push({ pathname: '/[username]/galleries', query: { username } });
  }, [username, showDrawer]);

  const handleShopIconClick = useCallback(() => {
    push({ pathname: '/shop' });
  }, []);

  return (
    <StyledStandardSidebar>
      <StyledIconContainer align="center" justify="space-between">
        <VStack>
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
        <VStack gap={32}>
          <SidebarIcon tooltipLabel="My Profile" onClick={handleProfileClick} icon={<UserIcon />} />
          <SidebarIcon
            tooltipLabel="Noitifications"
            onClick={handleNotificationsClick}
            icon={<BellIcon />}
            isActive={activeDrawer === 'notifications'}
          />
          <SidebarIcon
            tooltipLabel="Settings"
            onClick={handleSettingsClick}
            icon={<CogIcon />}
            isActive={activeDrawer === 'settings'}
          />
        </VStack>
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
  padding-top: 100px; // remove later
  min-width: 100%;
`;

const StyledIconContainer = styled(VStack)`
  height: 100%;
`;

const Icon = styled.img`
  width: 16px;
  height: 16px;
`;
