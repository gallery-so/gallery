import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { AnnouncementListFragment$key } from '~/generated/AnnouncementListFragment.graphql';
import colors from '~/shared/theme/colors';
import useUpdateUserExperience from '~/utils/graphql/experiences/useUpdateUserExperience';
import { HTTPS_URL } from '~/utils/regex';

import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, BaseS } from '../core/Text/Text';
import useAnnouncement, { AnnouncementType } from './useAnnouncement';

type Props = {
  queryRef: AnnouncementListFragment$key;
};

export default function AnnouncementList({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment AnnouncementListFragment on Query {
        ...useAnnouncementFragment
      }
    `,
    queryRef
  );

  const router = useRouter();
  const { announcements } = useAnnouncement(query);
  const track = useTrack();

  const update = useUpdateUserExperience();
  const { hideDrawer } = useDrawerActions();

  const handleClick = useCallback(
    (announcement: AnnouncementType) => {
      track('Announcement click', { type: announcement.key });

      // if there is a link, open it
      if (announcement.link) {
        // Check if link is external
        if (HTTPS_URL.test(announcement.link)) {
          // Open link in a new tab/window
          window.open(announcement.link, '_blank');
        } else {
          // Use Next.js router to navigate to internal page
          const route = {
            pathname: announcement.link,
          } as Route;
          router.push(route);
        }
      }

      if (!announcement.experienced) {
        update({
          type: announcement.key,
          experienced: true,
          optimisticExperiencesList: [
            {
              type: announcement.key,
              experienced: true,
            },
          ],
        });
      }

      hideDrawer();
    },
    [hideDrawer, router, track, update]
  );

  return (
    <div>
      {announcements.map((announcement) => {
        return (
          <StyledAnnouncement
            key={announcement.key}
            onClick={() => handleClick(announcement)}
            align="center"
            justify="space-between"
            hasAction={Boolean(announcement.link || !announcement.experienced)}
          >
            <StyledAnnouncementDescriptionContainer>
              <BaseM>
                <strong>{announcement.title}</strong>
              </BaseM>
              <BaseM>{announcement.description}</BaseM>
            </StyledAnnouncementDescriptionContainer>
            <StyledTimeContainer gap={8} align="center" justify="flex-end">
              <BaseS>{announcement.time}</BaseS>
              {!announcement.experienced && <StyledDot />}
            </StyledTimeContainer>
          </StyledAnnouncement>
        );
      })}
    </div>
  );
}

const StyledAnnouncement = styled(HStack)<{ hasAction: boolean }>`
  padding: 16px 12px;
  cursor: ${({ hasAction }) => (hasAction ? 'pointer' : 'default')};

  &:hover {
    ${({ hasAction }) => hasAction && `background-color: ${colors.faint};`}
  }
`;

const StyledDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: ${colors.activeBlue};
  border-radius: 9999px;
`;

const StyledAnnouncementDescriptionContainer = styled(VStack)`
  flex: 1;
`;

const StyledTimeContainer = styled(HStack)`
  width: 80px;
`;
