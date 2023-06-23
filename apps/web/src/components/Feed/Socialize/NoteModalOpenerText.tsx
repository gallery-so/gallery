import { ReactNode, useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import { NotesModal } from '~/components/Feed/Socialize/NotesModal/NotesModal';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { NoteModalOpenerTextFragment$key } from '~/generated/NoteModalOpenerTextFragment.graphql';
import { NoteModalOpenerTextQueryFragment$key } from '~/generated/NoteModalOpenerTextQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';

type Props = {
  children: ReactNode;
  eventRef: NoteModalOpenerTextFragment$key;
  queryRef: NoteModalOpenerTextQueryFragment$key;
};

export function NoteModalOpenerText({ children, eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment NoteModalOpenerTextFragment on FeedEvent {
        ...NotesModalFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment NoteModalOpenerTextQueryFragment on Query {
        ...NotesModalQueryFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const handleClick = useCallback(() => {
    showModal({
      content: <NotesModal fullscreen={isMobile} eventRef={event} queryRef={query} />,
      isFullPage: isMobile,
      isPaddingDisabled: true,
      headerVariant: 'standard',
    });
  }, [event, isMobile, query, showModal]);

  return <Text onClick={handleClick}>{children}</Text>;
}
const Text = styled.div.attrs({ role: 'button' })`
  cursor: pointer;
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 1;
  font-weight: 700;

  text-decoration: underline;

  color: ${colors.shadow};

  :hover {
    text-decoration: none;
  }
`;
