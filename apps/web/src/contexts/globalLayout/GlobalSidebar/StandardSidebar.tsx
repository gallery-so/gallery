import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { Notifications } from '~/components/Notifications/Notifications';
import Search from '~/components/Search/Search';
import Settings from '~/components/Settings/Settings';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { StandardSidebarFragment$key } from '~/generated/StandardSidebarFragment.graphql';
import useAuthModal from '~/hooks/useAuthModal';
import { useSearchHotkey } from '~/hooks/useSearchHotkey';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import BellIcon from '~/icons/BellIcon';
import CogIcon from '~/icons/CogIcon';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import GLogoIcon from '~/icons/GLogoIcon';
import SearchIcon from '~/icons/SearchIcon';
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

  const { showDrawer, hideDrawer } = useDrawerActions();
  const router = useRouter();

  const activeDrawerState = useDrawerState();
  const activeDrawerType = useMemo(
    () => activeDrawerState.activeDrawer?.content.type,
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
    });
  }, [query, showDrawer, track]);

  const handleNotificationsClick = useCallback(() => {
    showDrawer({
      content: <Notifications />,
    });
  }, [showDrawer]);

  const handleProfileClick = useCallback(() => {
    hideDrawer();
    track('Sidebar Profile Click', { username });
  }, [hideDrawer, track, username]);

  const handleEditClick = useCallback(() => {
    hideDrawer();
    track('Sidebar Edit Galleries Click', { username });
  }, [hideDrawer, track, username]);

  const handleShopIconClick = useCallback(async () => {
    track('Sidebar Shop Click');
    setMerchStoreUpsellExperienced();
  }, [setMerchStoreUpsellExperienced, track]);

  const handleHomeIconClick = useCallback(() => {
    hideDrawer();
    track('Sidebar Home Click');
  }, [hideDrawer, track]);

  const handleSearchClick = useCallback(() => {
    hideDrawer();
    track('Sidebar Search Click');
    showDrawer({
      content: <Search />,
    });
  }, [hideDrawer, showDrawer, track]);

  const isMobile = useIsMobileWindowWidth();

  const userGalleryRoute: Route = { pathname: '/[username]', query: { username } };
  const editGalleriesRoute: Route = { pathname: '/[username]/galleries', query: { username } };

  useSearchHotkey(() => {
    showDrawer({
      content: <Search />,
    });
  });

  if (isMobile) {
    return (
      <StyledStandardSidebar>
        <StyledMobileIconContainer align="center" justify="space-around">
          <SidebarIcon
            href={{ pathname: '/trending' }}
            tooltipLabel="Home"
            onClick={handleHomeIconClick}
            icon={<GLogoIcon />}
          />
          {isLoggedIn && (
            <>
              <SidebarIcon
                href={userGalleryRoute}
                tooltipLabel="My Profile"
                onClick={handleProfileClick}
                icon={<UserIcon />}
              />
              <SidebarIcon
                tooltipLabel="Search"
                onClick={handleSearchClick}
                icon={<SearchIcon />}
                isActive={activeDrawerType === Search}
              />
              <SidebarIcon
                tooltipLabel="Notifications"
                onClick={handleNotificationsClick}
                icon={<BellIcon />}
                isActive={activeDrawerType === Notifications}
                showUnreadDot={notificationCount > 0}
              />
              <SidebarIcon
                tooltipLabel="Settings"
                onClick={handleSettingsClick}
                icon={<CogIcon />}
                isActive={activeDrawerType === Settings}
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
          <SidebarIcon
            href={{ pathname: '/trending' }}
            tooltipLabel="Home"
            onClick={handleHomeIconClick}
            icon={<GLogoIcon />}
          />
          {isLoggedIn && (
            <SidebarIcon
              href={editGalleriesRoute}
              tooltipLabel="Edit galleries"
              onClick={handleEditClick}
              icon={<EditPencilIcon />}
              showBorderByDefault
            />
          )}
        </VStack>
        {isLoggedIn && (
          <VStack gap={32}>
            <SidebarIcon
              href={userGalleryRoute}
              tooltipLabel="My Profile"
              onClick={handleProfileClick}
              icon={<UserIcon />}
            />
            <SidebarIcon
              tooltipLabel="Search"
              onClick={handleSearchClick}
              icon={<SearchIcon />}
              isActive={activeDrawerType === Search}
            />
            <SidebarIcon
              tooltipLabel="Notifications"
              onClick={handleNotificationsClick}
              icon={<BellIcon />}
              isActive={activeDrawerType === Notifications}
            />
            <SidebarIcon
              tooltipLabel="Settings"
              onClick={handleSettingsClick}
              icon={<CogIcon />}
              isActive={activeDrawerType === Settings}
            />
          </VStack>
        )}
        <VStack>
          <SidebarIcon
            href={{ pathname: '/shop' }}
            tooltipLabel="(OBJECTS) Shop"
            onClick={handleShopIconClick}
            icon={<ShopIcon />}
            showUnreadDot={!isMerchStoreUpsellExperienced}
          />
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
