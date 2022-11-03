import { ReactNode, useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import { NotesModal } from '~/components/Feed/Socialize/NotesModal/NotesModal';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { NoteModalOpenerTextFragment$key } from '~/generated/NoteModalOpenerTextFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

type Props = {
  children: ReactNode;
  eventRef: NoteModalOpenerTextFragment$key;
};

export function NoteModalOpenerText({ children, eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment NoteModalOpenerTextFragment on FeedEvent {
        ...NotesModalFragment
      }
    `,
    eventRef
  );

  const { showModal } = useModalActions();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const handleClick = useCallback(() => {
    showModal({
      content: <NotesModal fullscreen={isMobile} eventRef={event} />,
      isFullPage: isMobile,
      isPaddingDisabled: true,
      headerVariant: 'standard',
    });
  }, [event, isMobile, showModal]);

  return <Text onClick={handleClick}>{children}</Text>;
}
const Text = styled.div.attrs({ role: 'button' })`
  cursor: pointer;
  font-family: ${BODY_FONT_FAMILY};
  font-size: 10px;
  line-height: 1;
  font-weight: 400;

  text-decoration: underline;

  color: ${colors.shadow};

  :hover {
    text-decoration: none;
  }
`;
