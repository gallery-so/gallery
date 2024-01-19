import { motion } from 'framer-motion';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { ConnectionHandler, graphql } from 'relay-runtime';
import styled from 'styled-components';

import Loader from '~/components/core/Loader/Loader';
import {
  NotificationList,
  NOTIFICATIONS_PER_PAGE,
} from '~/components/Notifications/NotificationList';
import DrawerHeader from '~/contexts/globalLayout/GlobalSidebar/DrawerHeader';
import { FADE_TRANSITION_TIME_SECONDS } from '~/contexts/globalLayout/transitionTiming';
import { NotificationsQuery } from '~/generated/NotificationsQuery.graphql';
import { useClearNotifications } from '~/shared/relay/useClearNotifications';

import breakpoints from '../core/breakpoints';
import { VStack } from '../core/Spacer/Stack';
import { ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL, rawTransitions } from '../core/transitions';

export function Notifications() {
  const query = useLazyLoadQuery<NotificationsQuery>(
    graphql`
      query NotificationsQuery($notificationsLast: Int!, $notificationsBefore: String) {
        ...NotificationListFragment

        viewer {
          ... on Viewer {
            id
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

  const [subView, setSubView] = useState<JSX.Element | null>(null);
  const toggleSubView = useCallback((subView?: JSX.Element) => {
    setSubView(subView ?? null);
  }, []);

  useEffect(() => {
    // When they close Notifications, clear their notifications
    return () => {
      if (!query.viewer?.user?.dbid || !query.viewer?.id) {
        return;
      }

      clearAllNotifications(query.viewer.user.dbid, [
        ConnectionHandler.getConnectionID(query.viewer.id, 'NotificationsFragment_notifications'),
        ConnectionHandler.getConnectionID(query.viewer.id, 'StandardSidebarFragment_notifications'),
      ]);
    };
  }, [clearAllNotifications, query.viewer]);

  return (
    <>
      <DrawerHeader headerText="Notifications" />
      <StyledNotifications>
        <Suspense
          fallback={
            <StyledLoader grow justify="center" align="center">
              <Loader size="large" />
            </StyledLoader>
          }
        >
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
