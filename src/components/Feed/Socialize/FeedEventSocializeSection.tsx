import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { FeedEventSocializeSectionFragment$key } from '__generated__/FeedEventSocializeSectionFragment.graphql';
import { HStack } from 'components/core/Spacer/Stack';
import { CommentIcon, AdmireIcon } from 'icons/SocializeIcons';
import styled, { css, keyframes } from 'styled-components';
import { CommentBox } from 'components/Feed/Socialize/CommentBox';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ClickLocation, useClickInAndOut } from 'components/Feed/Socialize/useClickInAndOut';

type FeedEventSocializeSectionProps = {
  eventRef: FeedEventSocializeSectionFragment$key;
};

export function FeedEventSocializeSection({ eventRef }: FeedEventSocializeSectionProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventSocializeSectionFragment on FeedEvent {
        id
      }
    `,
    eventRef
  );

  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleCommentEvent = useCallback((clickLocation: ClickLocation) => {
    if (clickLocation === 'inside' || clickLocation === 'exact') {
      setShowCommentBox((prev) => !prev);
    } else if (clickLocation === 'outside') {
      setShowCommentBox(false);
    }
  }, []);

  const commentIconRef = useRef<HTMLDivElement | null>(null);

  useClickInAndOut(commentIconRef, handleCommentEvent);

  return (
    <HStack justify="space-between">
      <div></div>
      <HStack align="center">
        <IconWrapper>
          <AdmireIcon />
        </IconWrapper>

        <IconWrapper>
          <CommentIcon ref={commentIconRef} />

          <CommentBoxWrapper active={showCommentBox}>
            <CommentBox />
          </CommentBoxWrapper>
        </IconWrapper>
      </HStack>
    </HStack>
  );
}

const CommentBoxWrapper = styled.div<{ active: boolean }>`
  position: absolute;
  bottom: 0;
  right: 0;

  z-index: 8;

  transition: transform 300ms ease-out, opacity 300ms ease-in-out;

  ${({ active }) =>
    active
      ? css`
          opacity: 1;
          transform: translateY(calc(100% + 8px));
        `
      : css`
          opacity: 0;
          transform: translateY(100%);
        `}
`;

const IconWrapper = styled.div`
  position: relative;
`;
