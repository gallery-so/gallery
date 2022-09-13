import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { FeedEventSocializeSectionFragment$key } from '__generated__/FeedEventSocializeSectionFragment.graphql';
import { HStack } from 'components/core/Spacer/Stack';
import { AdmireIcon, CommentIcon } from 'icons/SocializeIcons';
import styled from 'styled-components';
import { CommentBox } from 'components/Feed/Socialize/CommentBox';
import { useEffect, useRef, useState } from 'react';
import { CommentSection } from 'components/Feed/Socialize/CommentSection';

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

  const commentIconRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e) => {
      console.log('Click outside', e.target);
      setShowCommentBox(false);
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <HStack justify="space-between" align="flex-start" gap={24}>
      <CommentSection />

      <HStack align="center">
        <IconWrapper>
          <AdmireIcon onClick={() => setShowCommentBox((prev) => !prev)} />
        </IconWrapper>

        <IconWrapper>
          <CommentIcon onClick={() => setShowCommentBox((prev) => !prev)} ref={commentIconRef} />

          <CommentBox onClose={() => setShowCommentBox(false)} active={showCommentBox} />
        </IconWrapper>
      </HStack>
    </HStack>
  );
}

const IconWrapper = styled.div`
  position: relative;
`;
