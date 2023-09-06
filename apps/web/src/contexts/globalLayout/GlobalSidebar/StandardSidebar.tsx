import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import useAnnouncement from '~/components/Announcement/useAnnouncement';
import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { Notifications } from '~/components/Notifications/Notifications';
import DiscardPostConfirmation from '~/components/Posts/DiscardPostConfirmation';
import { PostComposerModalWithSelector } from '~/components/Posts/PostComposerModal';
import Search from '~/components/Search/Search';
import Settings from '~/components/Settings/Settings';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { usePostComposerContext } from '~/contexts/postComposer/PostComposerContext';
import { StandardSidebarFragment$key } from '~/generated/StandardSidebarFragment.graphql';
import useAuthModal from '~/hooks/useAuthModal';
import { useSearchHotkey } from '~/hooks/useSearchHotkey';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import BellIcon from '~/icons/BellIcon';
import CogIcon from '~/icons/CogIcon';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import GLogoIcon from '~/icons/GLogoIcon';
import { PlusSquareIcon } from '~/icons/PlusSquareIcon';
import SearchIcon from '~/icons/SearchIcon';
import ShopIcon from '~/icons/ShopIcon';
import UserIcon from '~/icons/UserIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import useExperience from '~/utils/graphql/experiences/useExperience';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import { useDrawerActions, useDrawerState } from './SidebarDrawerContext';
import SidebarIcon from './SidebarIcon';
import SidebarPfp from './SidebarPfp';

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
            ...PostComposerModalWithSelectorFragment
            user {
              username
              ...SidebarPfpFragment
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
        ...useAnnouncementFragment
        ...PostComposerModalWithSelectorQueryFragment
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const track = useTrack();

  const { showDrawer, hideDrawer } = useDrawerActions();
  const { query: routerQuery, pathname } = useRouter();

  const activeDrawerState = useDrawerState();
  const activeDrawerType = useMemo(
    () => activeDrawerState.activeDrawer?.content.type,
    [activeDrawerState]
  );

  const { totalUnreadAnnouncements } = useAnnouncement(query);

  const notificationCount = useMemo(() => {
    if (query.viewer && query.viewer.__typename === 'Viewer') {
      return (query.viewer.notifications?.unseenCount ?? 0) + totalUnreadAnnouncements;
    }

    return 0;
  }, [query.viewer, totalUnreadAnnouncements]);

  const showAuthModal = useAuthModal('sign-in');

  const { settings } = routerQuery;

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

  const { showModal } = useModalActions();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const handleSettingsClick = useCallback(() => {
    track('Sidebar Settings Click');
    showDrawer({
      content: <Settings queryRef={query} />,
    });
  }, [query, showDrawer, track]);

  const handleNotificationsClick = useCallback(() => {
    track('Sidebar Notifications Click');
    showDrawer({
      content: <Notifications />,
    });
  }, [showDrawer, track]);

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

  const { captionRef, setCaption } = usePostComposerContext();

  const handleCreatePostClick = useCallback(() => {
    hideDrawer();

    if (!isLoggedIn) {
      return;
    }

    showModal({
      id: 'post-composer',
      content: <PostComposerModalWithSelector viewerRef={query?.viewer} queryRef={query} />,
      headerVariant: 'thicc',
      isFullPage: isMobile,
      onCloseOverride: (onClose: () => void) => {
        if (!captionRef.current) {
          onClose();
          return;
        }

        showModal({
          headerText: 'Are you sure?',
          content: (
            <DiscardPostConfirmation
              onSaveDraft={() => {
                onClose();
              }}
              onDiscard={() => {
                setCaption('');
                onClose();
              }}
            />
          ),
          isFullPage: false,
        });
      },
    });
    track('Sidebar Create Post Click');
  }, [hideDrawer, isLoggedIn, showModal, query, isMobile, track, captionRef, setCaption]);

  const handleSearchClick = useCallback(() => {
    track('Sidebar Search Click');
    showDrawer({
      content: <Search />,
    });
  }, [showDrawer, track]);

  const isKoalaEnabled = isFeatureEnabled(FeatureFlag.KOALA, query);

  const userGalleryRoute: Route = useMemo(() => {
    return { pathname: '/[username]', query: { username } };
  }, [username]);

  const editGalleriesRoute: Route = useMemo(() => {
    return { pathname: '/[username]/galleries', query: { username, mode: 'edit' } };
  }, [username]);

  const isLoggedInProfileActive = useMemo(() => {
    // prevent highlight if another item in the drawer is selected
    if (activeDrawerType) {
      return false;
    }
    const currentRoute = { pathname, query: routerQuery };
    return JSON.stringify(userGalleryRoute) === JSON.stringify(currentRoute);
  }, [activeDrawerType, pathname, routerQuery, userGalleryRoute]);

  const isEditGalleriesActive = useMemo(() => {
    // prevent highlight if another item in the drawer is selected
    if (activeDrawerType) {
      return false;
    }
    const currentRoute = { pathname, query: routerQuery };
    return JSON.stringify(editGalleriesRoute) === JSON.stringify(currentRoute);
  }, [activeDrawerType, pathname, routerQuery, editGalleriesRoute]);

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
            href={{ pathname: '/home' }}
            tooltipLabel="Home"
            onClick={handleHomeIconClick}
            icon={<GLogoIcon />}
          />
          {isLoggedIn ? (
            <>
              <SidebarIcon
                tooltipLabel="Search"
                onClick={handleSearchClick}
                icon={<SearchIcon />}
                isActive={activeDrawerType === Search}
              />
              {isKoalaEnabled && (
                <SidebarIcon
                  tooltipLabel="Create a post"
                  onClick={handleCreatePostClick}
                  icon={<PlusSquareIcon />}
                />
              )}
              <SidebarIcon
                tooltipLabel="Updates"
                onClick={handleNotificationsClick}
                icon={<BellIcon />}
                isActive={activeDrawerType === Notifications}
                showUnreadDot={notificationCount > 0}
              />
              <SidebarIcon
                href={userGalleryRoute}
                tooltipLabel="My Profile"
                onClick={handleProfileClick}
                icon={<UserIcon />}
                isActive={isLoggedInProfileActive}
              />
            </>
          ) : (
            <SidebarIcon
              tooltipLabel="Search"
              onClick={handleSearchClick}
              icon={<SearchIcon />}
              isActive={activeDrawerType === Search}
            />
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
            href={{ pathname: '/home' }}
            tooltipLabel="Home"
            onClick={handleHomeIconClick}
            icon={<GLogoIcon />}
          />
          {isLoggedIn && query.viewer.user && (
            <VStack gap={12}>
              <SidebarPfp
                userRef={query.viewer.user}
                href={userGalleryRoute}
                onClick={handleProfileClick}
              />
              {isKoalaEnabled && (
                <SidebarIcon
                  tooltipLabel="Create a post"
                  onClick={handleCreatePostClick}
                  icon={<PlusSquareIcon />}
                />
              )}
            </VStack>
          )}
        </VStack>
        {isLoggedIn ? (
          <VStack gap={32}>
            <SidebarIcon
              href={editGalleriesRoute}
              tooltipLabel="Edit galleries"
              onClick={handleEditClick}
              icon={<EditPencilIcon />}
              isActive={isEditGalleriesActive}
            />
            <SidebarIcon
              tooltipLabel="Search"
              onClick={handleSearchClick}
              icon={<SearchIcon />}
              isActive={activeDrawerType === Search}
            />
            <SidebarIcon
              tooltipLabel="Updates"
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
          </VStack>
        ) : (
          <SidebarIcon
            tooltipLabel="Search"
            onClick={handleSearchClick}
            icon={<SearchIcon />}
            isActive={activeDrawerType === Search}
          />
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
