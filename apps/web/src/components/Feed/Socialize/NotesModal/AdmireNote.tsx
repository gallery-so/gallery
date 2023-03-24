import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { ListItem } from '~/components/Feed/Socialize/NotesModal/ListItem';
import { TimeAgoText } from '~/components/Feed/Socialize/NotesModal/TimeAgoText';
import { UsernameLink } from '~/components/Feed/Socialize/NotesModal/UsernameLink';
import { AdmireNoteFragment$key } from '~/generated/AdmireNoteFragment.graphql';
import { AdmireIcon, IconWrapper } from '~/icons/SocializeIcons';
import { getTimeSince } from '~/shared/utils/time';

type AdmireNoteProps = {
  admireRef: AdmireNoteFragment$key;
};

export function AdmireNote({ admireRef }: AdmireNoteProps) {
  const admire = useFragment(
    graphql`
      fragment AdmireNoteFragment on Admire {
        __typename

        creationTime
        admirer {
          username
        }
      }
    `,
    admireRef
  );

  const timeAgo = admire.creationTime ? getTimeSince(admire.creationTime) : null;

  return (
    <StyledListItem justify="space-between" gap={4}>
      <HStack gap={4} align="center">
        <AdmireIcon active width={16} height={16} />
        <UsernameLink username={admire.admirer?.username ?? null} />
        <BaseM>admired this</BaseM>
      </HStack>

      <TimeAgoText color={colors.metal}>{timeAgo}</TimeAgoText>
    </StyledListItem>
  );
}

const StyledListItem = styled(ListItem)`
  ${IconWrapper} {
    padding-left: 0;
    cursor: default;
  }
`;
