// import { ReactNode, useCallback, useMemo } from 'react';
// import { useFragment } from 'react-relay';
// import { graphql } from 'relay-runtime';
// import styled from 'styled-components';

// import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
// import { CommentsModal } from '~/components/Feed/Socialize/CommentsModal/CommentsModal';
// import { useModalActions } from '~/contexts/modal/ModalContext';
// import { NoteModalOpenerTextFragment$key } from '~/generated/NoteModalOpenerTextFragment.graphql';
// import { NoteModalOpenerTextQueryFragment$key } from '~/generated/NoteModalOpenerTextQueryFragment.graphql';
// import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
// import colors from '~/shared/theme/colors';

// import { FeedEventsCommentsModal } from './CommentsModal/FeedEventsCommentsModal';
// import PostCommentsModal from './CommentsModal/PostCommentsModal';

// type Props = {
//   children: ReactNode;
//   eventRef: NoteModalOpenerTextFragment$key;
//   queryRef: NoteModalOpenerTextQueryFragment$key;
// };

// export function NoteModalOpenerText({ children, eventRef, queryRef }: Props) {
//   const event = useFragment(
//     graphql`
//       fragment NoteModalOpenerTextFragment on FeedEventOrError {
//         __typename
//         ...FeedEventsCommentsModalFragment
//         ...PostCommentsModalFragment
//       }
//     `,
//     eventRef
//   );

//   const query = useFragment(
//     graphql`
//       fragment NoteModalOpenerTextQueryFragment on Query {
//         ...FeedEventsCommentsModalQueryFragment
//         ...PostCommentsModalQueryFragment
//       }
//     `,
//     queryRef
//   );

//   const { showModal } = useModalActions();
//   const isMobile = useIsMobileOrMobileLargeWindowWidth();

//   const ModalContent = useMemo(() => {
//     if (event.__typename === 'FeedEvent') {
//       return <FeedEventsCommentsModal fullscreen={isMobile} eventRef={event} queryRef={query} />;
//     }

//     return <PostCommentsModal fullscreen={isMobile} postRef={event} queryRef={query} />;
//   }, [event, isMobile, query]);

//   // depending on the feed item type, show different modal
//   const handleClick = useCallback(() => {
//     showModal({
//       content: ModalContent,
//       isFullPage: isMobile,
//       isPaddingDisabled: true,
//       headerVariant: 'standard',
//     });
//   }, [ModalContent, isMobile, showModal]);

//   return <Text onClick={handleClick}>{children}</Text>;
// }
// const Text = styled.div.attrs({ role: 'button' })`
//   cursor: pointer;
//   font-family: ${BODY_FONT_FAMILY};
//   font-size: 12px;
//   line-height: 1;
//   font-weight: 700;

//   text-decoration: underline;

//   color: ${colors.shadow};

//   :hover {
//     text-decoration: none;
//   }
// `;
