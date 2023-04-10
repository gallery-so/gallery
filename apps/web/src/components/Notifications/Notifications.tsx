import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import Loader from '~/components/core/Loader/Loader';
import {
  NotificationList,
  NOTIFICATIONS_PER_PAGE,
} from '~/components/Notifications/NotificationList';
import { useClearNotifications } from '~/components/Notifications/useClearNotifications';
import DrawerHeader from '~/contexts/globalLayout/GlobalSidebar/DrawerHeader';
import { FADE_TRANSITION_TIME_SECONDS } from '~/contexts/globalLayout/transitionTiming';
import { NotificationsQuery } from '~/generated/NotificationsQuery.graphql';

import AnnouncementList from '../Announcement/AnnouncementList';
import useAnnouncement from '../Announcement/useAnnouncement';
import breakpoints from '../core/breakpoints';
import colors from '../core/colors';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL, rawTransitions } from '../core/transitions';

type MenuTabs = 'Notifications' | 'Announcement';

export function Notifications() {
  const query = useLazyLoadQuery<NotificationsQuery>(
    graphql`
      query NotificationsQuery($notificationsLast: Int!, $notificationsBefore: String) {
        ...NotificationListFragment
        ...AnnouncementListFragment
        ...useAnnouncementFragment
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    { notificationsLast: NOTIFICATIONS_PER_PAGE },
    { fetchPolicy: 'store-and-network' }
  );

  const clearAllNotifications = useClearNotifications();

  const { totalUnreadAnnouncements } = useAnnouncement(query);

  const [subView, setSubView] = useState<JSX.Element | null>(null);
  const toggleSubView = useCallback((subView?: JSX.Element) => {
    setSubView(subView ?? null);
  }, []);

  const userId = query.viewer?.user?.dbid ?? '';
  useEffect(() => {
    // When they close Notifications, clear their notifications
    return () => {
      clearAllNotifications(userId);
    };
  }, [clearAllNotifications, userId]);

  const [activeTab, setActiveTab] = useState<MenuTabs>('Notifications');

  const handleTabClick = useCallback((tab: MenuTabs) => {
    setActiveTab(tab);
  }, []);

  return (
    <>
      <DrawerHeader headerText="Updates" />
      <StyledNotifications>
        <Suspense
          fallback={
            <StyledLoader grow justify="center" align="center">
              <Loader size="large" />
            </StyledLoader>
          }
        >
          <StyledUpdatesNav gap={16}>
            <StyledNavText
              active={activeTab === 'Notifications'}
              onClick={() => handleTabClick('Notifications')}
            >
              Notifications
            </StyledNavText>
            <StyledNavText
              active={activeTab === 'Announcement'}
              onClick={() => handleTabClick('Announcement')}
            >
              <HStack gap={4} align="center">
                What's new
                {totalUnreadAnnouncements > 0 && (
                  <StyledUpdatesNotification align="center" justify="center">
                    {totalUnreadAnnouncements}
                  </StyledUpdatesNotification>
                )}
              </HStack>
            </StyledNavText>
          </StyledUpdatesNav>
          {activeTab === 'Notifications' && (
            <AnimatePresence>
              <StyledSubView
                key={subView ? 'NotificationsSubView' : 'NotificationsList'}
                initial={{
                  opacity: 0,
                  x: subView
                    ? ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL
                    : -ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: subView
                    ? ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL
                    : -ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
                }}
                transition={{
                  ease: rawTransitions.cubicValues,
                  duration: FADE_TRANSITION_TIME_SECONDS,
                }}
              >
                {subView ? (
                  subView
                ) : (
                  <NotificationList queryRef={query} toggleSubView={toggleSubView} />
                )}
              </StyledSubView>
            </AnimatePresence>
          )}
          {activeTab === 'Announcement' && (
            <AnimatePresence>
              <StyledSubView
                key="AnnouncementList"
                initial={{
                  opacity: 0,
                  x: -ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: -ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
                }}
                transition={{
                  ease: rawTransitions.cubicValues,
                  duration: FADE_TRANSITION_TIME_SECONDS,
                }}
              >
                <AnnouncementList queryRef={query} />
              </StyledSubView>
            </AnimatePresence>
          )}
        </Suspense>
      </StyledNotifications>
    </>
  );
}

const StyledNotifications = styled(VStack)`
  height: 100%;
  width: 100%;
  padding: 4px;
  position: relative;
  overflow-y: scroll;
  overflow-x: hidden;
  overscroll-behavior: contain;

  @media only screen and ${breakpoints.tablet} {
    width: 420px;
  }
`;

const StyledLoader = styled(VStack)`
  height: 100%;
`;

const StyledSubView = styled(motion.div)`
  height: 100%;
  width: 100%;
`;

const StyledNavText = styled(BaseM)<{ active: boolean }>`
  font-size: 12px;
  text-transform: uppercase;
  color: ${({ active }) => (active ? colors.offBlack : colors.metal)};
  cursor: pointer;
`;

const StyledUpdatesNav = styled(HStack)`
  padding: 16px 12px;
`;

const StyledUpdatesNotification = styled(HStack)`
  background-color: ${colors.activeBlue};
  color: ${colors.white};
  font-weight: 700;
  font-size: 10px;
  border-radius: 100px;
  width: 16px;
  height: 12px;
`;
