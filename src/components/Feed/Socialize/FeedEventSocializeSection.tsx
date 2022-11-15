import { useCallback, useRef, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import {
  FEED_EVENT_ROW_WIDTH_DESKTOP,
  FEED_EVENT_ROW_WIDTH_TABLET,
} from '~/components/Feed/dimensions';
import { AdmireButton } from '~/components/Feed/Socialize/AdmireButton';
import { CommentBox } from '~/components/Feed/Socialize/CommentBox';
import { Interactions } from '~/components/Feed/Socialize/Interactions';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { FeedEventSocializeSectionFragment$key } from '~/generated/FeedEventSocializeSectionFragment.graphql';
import { FeedEventSocializeSectionQueryFragment$key } from '~/generated/FeedEventSocializeSectionQueryFragment.graphql';
import { AuthModal } from '~/hooks/useAuthModal';
import { CommentIcon } from '~/icons/SocializeIcons';

type FeedEventSocializeSectionProps = {
  onPotentialLayoutShift: () => void;
  eventRef: FeedEventSocializeSectionFragment$key;
  queryRef: FeedEventSocializeSectionQueryFragment$key;
};

export function FeedEventSocializeSection({
  eventRef,
  queryRef,
  onPotentialLayoutShift,
}: FeedEventSocializeSectionProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventSocializeSectionFragment on FeedEvent {
        ...CommentBoxFragment
        ...InteractionsFragment
        ...AdmireButtonFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventSocializeSectionQueryFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            user {
              id
              dbid
              username
            }
          }
        }

        ...AdmireButtonQueryFragment
        ...InteractionsQueryFragment
        ...CommentBoxQueryFragment
        ...useAuthModalFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();

  const commentIconRef = useRef<HTMLDivElement | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleClose = useCallback(() => {
    setShowCommentBox(false);
  }, []);

  const handleToggle = useCallback(() => {
    if (query.viewer?.__typename !== 'Viewer') {
      showModal({
        content: <AuthModal queryRef={query} />,
      });

      return;
    }

    setShowCommentBox((previous) => !previous);
  }, [query, showModal]);

  return (
    <SocializeSectionWrapper>
      <SocializedSectionPadding>
        <HStack justify="space-between" align="flex-end" gap={24}>
          <VStack shrink>
            <Interactions
              onPotentialLayoutShift={onPotentialLayoutShift}
              eventRef={event}
              queryRef={query}
            />
          </VStack>

          <HStack align="center">
            <IconWrapper>
              <AdmireButton eventRef={event} queryRef={query} />
            </IconWrapper>

            <IconWrapper>
              <CommentIcon onClick={handleToggle} ref={commentIconRef} />

              <CommentBox
                onClose={handleClose}
                eventRef={event}
                queryRef={query}
                active={showCommentBox}
              />
            </IconWrapper>
          </HStack>
        </HStack>
      </SocializedSectionPadding>
    </SocializeSectionWrapper>
  );
}

const SocializedSectionPadding = styled.div`
  padding: 0 16px;
`;

// Modeled after StyledEventInner
const SocializeSectionWrapper = styled.div`
  max-width: ${FEED_EVENT_ROW_WIDTH_TABLET}px;
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }

  // Center in space
  margin: 0 auto;
  padding-bottom: 16px;
`;

const IconWrapper = styled.div`
  position: relative;
`;
