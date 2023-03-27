import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { AnnouncementListFragment$key } from '~/generated/AnnouncementListFragment.graphql';
import useUpdateUserExperience from '~/utils/graphql/experiences/useUpdateUserExperience';

import colors from '../core/colors';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, BaseS } from '../core/Text/Text';
import useAnnoucement, { AnnouncementType } from './useAnnouncement';

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
  const { announcements } = useAnnoucement(query);

  const update = useUpdateUserExperience();
  const { hideDrawer } = useDrawerActions();

  const handleClick = useCallback(
    (announcement: AnnouncementType) => {
      if (announcement.experienced || !announcement.link) {
        return;
      }

      // if there is a link, open it
      if (announcement.link) {
        router.push(announcement.link);
        hideDrawer();
      }

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
    },
    [hideDrawer, router, update]
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
            hasAction={!!announcement.link && !announcement.experienced}
          >
            <VStack>
              <BaseM>
                <strong>{announcement.title}</strong>
              </BaseM>
              <BaseM>{announcement.description}</BaseM>
            </VStack>
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

const StyledTimeContainer = styled(HStack)`
  width: 80px;
`;
