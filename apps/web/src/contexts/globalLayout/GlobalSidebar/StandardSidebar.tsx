import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { Notifications } from '~/components/Notifications/Notifications';
import DiscardPostConfirmation from '~/components/Posts/DiscardPostConfirmation';
import { PostComposerModalWithSelector } from '~/components/Posts/PostComposerModal';
import Search from '~/components/Search/Search';
import Settings from '~/components/Settings/Settings';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { usePostComposerContext } from '~/contexts/postComposer/PostComposerContext';
import { useSanityAnnouncementContext } from '~/contexts/SanityAnnouncementProvider';
import { StandardSidebarFragment$key } from '~/generated/StandardSidebarFragment.graphql';
import { useSearchHotkey } from '~/hooks/useSearchHotkey';
import useUniversalAuthModal from '~/hooks/useUniversalAuthModal';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import BellIcon from '~/icons/BellIcon';
import CogIcon from '~/icons/CogIcon';
import GLogoIcon from '~/icons/GLogoIcon';
import HomeIcon from '~/icons/HomeIcon';
import { PlusSquareIcon } from '~/icons/PlusSquareIcon';
import { QuestionMarkIcon } from '~/icons/QuestionMarkIcon';
import SearchIcon from '~/icons/SearchIcon';
import { contexts, flows } from '~/shared/analytics/constants';
import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import DrawerHeader from './DrawerHeader';
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

  const { announcement, hasSeenAnnouncement } = useSanityAnnouncementContext();

  const notificationCount = useMemo(() => {
    const announcementNotificationCount = announcement && !hasSeenAnnouncement ? 1 : 0;

    if (query.viewer && query.viewer.__typename === 'Viewer') {
      return (query.viewer.notifications?.unseenCount ?? 0) + announcementNotificationCount;
    }

    return 0 + announcementNotificationCount;
  }, [announcement, hasSeenAnnouncement, query.viewer]);

  const username = (isLoggedIn && query.viewer.user?.username) || '';

  const { showModal } = useModalActions();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const handleSettingsClick = useCallback(() => {
    track('Sidebar Settings Click');
    showDrawer({
      content: (
        <Settings
          queryRef={query}
          header={<DrawerHeader headerText="Settings" />}
          onLogout={hideDrawer}
        />
      ),
    });
  }, [hideDrawer, query, showDrawer, track]);

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

  const handleFaqIconClick = useCallback(async () => {
    track('Sidebar FAQ Click');
  }, [track]);

  const handleHomeIconClick = useCallback(() => {
    hideDrawer();
    track('Sidebar Home Click');
  }, [hideDrawer, track]);

  const { captionRef, clearUrlParamsAndSelections } = usePostComposerContext();

  const handleOpenPostComposer = useCallback(
    (eventFlow: GalleryElementTrackingProps['eventFlow']) => {
      showModal({
        id: 'post-composer',
        content: <PostComposerModalWithSelector eventFlow={eventFlow} />,
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
                  onClose();
                  clearUrlParamsAndSelections();
                }}
              />
            ),
            isFullPage: false,
          });
        },
      });
    },
    [captionRef, clearUrlParamsAndSelections, isMobile, showModal]
  );

  const handleCreatePostClick = useCallback(() => {
    track('Sidebar Create Post Click', {
      context: contexts.Posts,
      flow: flows['Web Sidebar Post Create Flow'],
    });

    hideDrawer();

    if (!isLoggedIn) {
      return;
    }

    handleOpenPostComposer(flows['Web Sidebar Post Create Flow']);
  }, [hideDrawer, isLoggedIn, handleOpenPostComposer, track]);

  const handleSearchClick = useCallback(() => {
    track('Sidebar Search Click');
    showDrawer({
      content: <Search />,
    });
  }, [showDrawer, track]);

  useSearchHotkey(() => {
    showDrawer({
      content: <Search />,
    });
  });

  // feels like a hack but if this hook is run multiple times via parent component re-render,
  // the same drawer is opened multiple times
  const { settings, composer, referrer } = routerQuery;
  const isSettingsOpen = useRef(false);
  const isComposerOpen = useRef(false);

  const showAuthModal = useUniversalAuthModal();

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

    if (composer === 'true' && !isComposerOpen.current) {
      track('Arrive On Gallery', {
        context: contexts.Posts,
        flow: flows['Share To Gallery'],
        authenticated: isLoggedIn,
        referrer,
      });
      if (isLoggedIn) {
        handleOpenPostComposer(flows['Share To Gallery']);
        return;
      }
      showAuthModal();
    }
  }, [
    composer,
    handleOpenPostComposer,
    isLoggedIn,
    query,
    referrer,
    settings,
    showAuthModal,
    showDrawer,
    track,
  ]);

  if (isMobile) {
    return (
      <StyledStandardSidebar>
        <StyledMobileIconContainer align="center" justify="space-around">
          <SidebarIcon
            to={{ pathname: isLoggedIn ? '/home' : '/' }}
            tooltipLabel="Home"
            onClick={handleHomeIconClick}
            icon={isLoggedIn ? <HomeIcon /> : <GLogoIcon />}
            isActive={pathname === '/home' && !activeDrawerType}
          />
          {isLoggedIn ? (
            <>
              <SidebarIcon
                tooltipLabel="Search"
                onClick={handleSearchClick}
                icon={<SearchIcon />}
                isActive={activeDrawerType === Search}
              />
              <SidebarIcon
                tooltipLabel="Create a post"
                onClick={handleCreatePostClick}
                icon={<PlusSquareIcon />}
              />
              <SidebarIcon
                tooltipLabel="Notifications"
                onClick={handleNotificationsClick}
                icon={<BellIcon />}
                isActive={activeDrawerType === Notifications}
                showUnreadDot={notificationCount > 0}
              />
              {query.viewer.user && (
                <SidebarPfp userRef={query.viewer.user} onClick={handleProfileClick} />
              )}
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
          {!isLoggedIn && (
            <SidebarIcon
              to={{ pathname: '/' }}
              tooltipLabel="Home"
              onClick={handleHomeIconClick}
              icon={<GLogoIcon />}
            />
          )}
          {isLoggedIn && query.viewer.user && (
            <SidebarPfp userRef={query.viewer.user} onClick={handleProfileClick} />
          )}
        </VStack>
        {isLoggedIn ? (
          <VStack gap={24}>
            <SidebarIcon
              to={{ pathname: '/home' }}
              tooltipLabel="Home"
              onClick={handleHomeIconClick}
              icon={<HomeIcon />}
              isActive={pathname === '/home' && !activeDrawerType}
            />
            <SidebarIcon
              tooltipLabel="Create a post"
              onClick={handleCreatePostClick}
              icon={<PlusSquareIcon />}
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
          </VStack>
        ) : (
          <SidebarIcon
            tooltipLabel="Search"
            onClick={handleSearchClick}
            icon={<SearchIcon />}
            isActive={activeDrawerType === Search}
          />
        )}
        <VStack gap={24}>
          {isLoggedIn && (
            <SidebarIcon
              tooltipLabel="Settings"
              onClick={handleSettingsClick}
              icon={<CogIcon />}
              isActive={activeDrawerType === Settings}
            />
          )}
          <SidebarIcon
            href="https://gallery-so.notion.site/Gallery-Support-Docs-d317f077d7614935bdf2c039349823d2"
            tooltipLabel="Support/FAQ"
            onClick={handleFaqIconClick}
            icon={<QuestionMarkIcon color={colors.black[800]} />}
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
