import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { AnnouncementListFragment$key } from '~/generated/AnnouncementListFragment.graphql';

import colors from '../core/colors';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, BaseS } from '../core/Text/Text';
import useAnnoucement from './useAnnouncement';

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

  const { announcements } = useAnnoucement(query);

  return (
    <div>
      {announcements.map((announcement) => {
        return (
          <StyledAnnouncement key={announcement.key} align="center" justify="space-between">
            <VStack>
              <BaseM>
                <strong>{announcement.title}</strong>
              </BaseM>
              <BaseM>{announcement.description}</BaseM>
            </VStack>
            <HStack gap={8} align="center">
              <BaseS>{announcement.time}</BaseS>
              {!announcement.experienced && <StyledDot />}
            </HStack>
          </StyledAnnouncement>
        );
      })}
    </div>
  );
}

const StyledAnnouncement = styled(HStack)`
  padding: 16px 12px;

  &:hover {
    background-color: ${colors.faint};
  }
`;

const StyledDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: ${colors.activeBlue};
  border-radius: 9999px;
`;
