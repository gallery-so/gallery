import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { AnnouncementListFragment$key } from '~/generated/AnnouncementListFragment.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';
import { HTTPS_URL } from '~/shared/utils/regex';
import { useOptimisticallyDismissExperience } from '~/utils/graphql/experiences/useUpdateUserExperience';

import { Chip } from '../core/Chip/Chip';
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

  const dismissExperience = useOptimisticallyDismissExperience();
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
        dismissExperience(announcement.key);
      }

      hideDrawer();
    },
    [dismissExperience, hideDrawer, router, track]
  );

  // TODO [GAL-3033]: come up with a system to "dismiss all announcement-type experiences"
  useEffect(() => {
    return () => {
      for (const announcement of announcements) {
        if (!announcement.experienced) {
          dismissExperience(announcement.key);
        }
      }
    };
  }, [announcements, dismissExperience]);

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
            gap={announcement.ctaText ? 24 : 64}
          >
            <StyledAnnouncementDescriptionContainer>
              <BaseM>
                <strong>{announcement.title}</strong>
              </BaseM>
              <BaseM>{announcement.description}</BaseM>
            </StyledAnnouncementDescriptionContainer>
            <HStack gap={12}>
              {announcement.ctaText && (
                <StyledCTAContainer>
                  <StyledChip>Download</StyledChip>
                </StyledCTAContainer>
              )}
              <StyledTimeContainer gap={8} align="center" justify="flex-end">
                <BaseS>{announcement.time}</BaseS>
                {!announcement.experienced && <StyledDot />}
              </StyledTimeContainer>
            </HStack>
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

const StyledCTAContainer = styled(HStack)``;

const StyledChip = styled(Chip)`
  background-color: ${colors.black['800']};
  color: ${colors.offWhite};
  width: 88px;
`;

const StyledTimeContainer = styled(HStack)``;
