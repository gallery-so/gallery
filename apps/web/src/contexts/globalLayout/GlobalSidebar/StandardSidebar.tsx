import Link from 'next/link';
import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { Notifications } from '~/components/Notifications/Notifications';
import Settings from '~/components/Settings/Settings';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { StandardSidebarFragment$key } from '~/generated/StandardSidebarFragment.graphql';
import useAuthModal from '~/hooks/useAuthModal';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import BellIcon from '~/icons/BellIcon';
import CogIcon from '~/icons/CogIcon';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import GLogoIcon from '~/icons/GLogoIcon';
import ShopIcon from '~/icons/ShopIcon';
import UserIcon from '~/icons/UserIcon';
import useExperience from '~/utils/graphql/experiences/useExperience';

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
            notifications(last: 1) @connection(key: "StandardSidebarFragment_notifications") {
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
        ...SettingsFragment
        ...useExperienceFragment
      }
    `,
    queryRef
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const track = useTrack();

  const { showDrawer } = useDrawerActions();
  const router = useRouter();

  const activeDrawerState = useDrawerState();
  const activeDrawerName = useMemo(
    () => activeDrawerState.activeDrawer?.drawerName,
    [activeDrawerState]
  );

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
  const showAuthModal = useAuthModal('sign-in');

  const { settings } = router.query;

  // feels like a hack but if this hook is run multiple times via parent component re-render,
  // the same drawer is opened multiple times
  const isSettingsOpen = useRef(false);

  useEffect(() => {
    // Only show the modal if the user is logged in and the settings query param is set
    if (settings === 'true' && !isSettingsOpen.current) {
      if (isLoggedIn) {
        showDrawer({
          content: <Settings queryRef={query} />,
          headerText: 'Settings',
          drawerName: 'settings',
        });
        return;
      }
      showAuthModal();
    }
  }, [isLoggedIn, query, settings, showAuthModal, showDrawer]);

  const [isMerchStoreUpsellExperienced, setMerchStoreUpsellExperienced] = useExperience({
    type: 'MerchStoreUpsell',
    queryRef: query,
  });

  const username = (isLoggedIn && query.viewer.user?.username) || '';

  const handleSettingsClick = useCallback(() => {
    track('Sidebar Settings Click');
    showDrawer({
      content: <Settings queryRef={query} />,
      headerText: 'Settings',
      drawerName: 'settings',
    });
  }, [query, showDrawer, track]);

  const handleNotificationsClick = useCallback(() => {
    showDrawer({
      content: <Notifications />,
      headerText: 'Notifications',
      drawerName: 'notifications',
    });
  }, [showDrawer]);

  const handleProfileClick = useCallback(() => {
    track('Sidebar Profile Click', { username });
  }, [track, username]);

  const handleEditClick = useCallback(() => {
    track('Sidebar Edit Galleries Click', { username });
  }, [track, username]);

  const handleShopIconClick = useCallback(async () => {
    track('Sidebar Shop Click');
    setMerchStoreUpsellExperienced();
  }, [setMerchStoreUpsellExperienced, track]);

  const handleHomeIconClick = useCallback(() => {
    track('Sidebar Home Click');
  }, [track]);

  const isMobile = useIsMobileWindowWidth();

  const userGalleryRoute: Route = { pathname: '/[username]', query: { username } };
  const editGalleriesRoute: Route = { pathname: '/[username]/galleries', query: { username } };

  if (isMobile) {
    return (
      <StyledStandardSidebar>
        <StyledMobileIconContainer align="center" justify="space-around">
          <Link href={{ pathname: '/trending' }}>
            <SidebarIcon tooltipLabel="Home" onClick={handleHomeIconClick} icon={<GLogoIcon />} />
          </Link>
          {isLoggedIn && (
            <>
              <Link href={userGalleryRoute}>
                <SidebarIcon
                  tooltipLabel="My Profile"
                  onClick={handleProfileClick}
                  icon={<UserIcon />}
                />
              </Link>
              <SidebarIcon
                tooltipLabel="Notifications"
                onClick={handleNotificationsClick}
                icon={<BellIcon />}
                isActive={activeDrawerName === 'notifications'}
                showUnreadDot={notificationCount > 0}
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
          <Link href={{ pathname: '/trending' }}>
            <SidebarIcon tooltipLabel="Home" onClick={handleHomeIconClick} icon={<GLogoIcon />} />
          </Link>
          {isLoggedIn && (
            <Link href={editGalleriesRoute}>
              <SidebarIcon
                tooltipLabel="Edit galleries"
                onClick={handleEditClick}
                icon={<EditPencilIcon />}
                showBorderByDefault
              />
            </Link>
          )}
        </VStack>
        {isLoggedIn && (
          <VStack gap={32}>
            <Link href={userGalleryRoute}>
              <SidebarIcon
                tooltipLabel="My Profile"
                onClick={handleProfileClick}
                icon={<UserIcon />}
              />
            </Link>
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
          <Link href={{ pathname: '/shop' }}>
            <SidebarIcon
              tooltipLabel="(OBJECTS) Shop"
              onClick={handleShopIconClick}
              icon={<ShopIcon />}
              showUnreadDot={!isMerchStoreUpsellExperienced}
            />
          </Link>
        </VStack>
      </StyledIconContainer>
    </StyledStandardSidebar>
  );
}

const StyledStandardSidebar = styled.div`
  min-width: 100%;

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
