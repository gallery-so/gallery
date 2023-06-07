import { useEffect, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { CommentLineFragment$key } from '~/generated/CommentLineFragment.graphql';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';

type CommentLineProps = {
  commentRef: CommentLineFragment$key;
};

export function CommentLine({ commentRef }: CommentLineProps) {
  const comment = useFragment(
    graphql`
      fragment CommentLineFragment on Comment {
        dbid

        creationTime

        comment @required(action: THROW)
        commenter {
          username
          ...HoverCardOnUsernameFragment
        }
      }
    `,
    commentRef
  );

  const [, setCount] = useState(0);
  useEffect(function rerenderEveryFewSecondsToUpdateTimeAgo() {
    const intervalId = setInterval(() => {
      setCount((previous) => previous + 1);
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const timeAgo = comment.creationTime ? getTimeSince(comment.creationTime) : null;

  return (
    <HStack key={comment.dbid} gap={4} align="flex-end">
      {comment.commenter && (
        <HoverCardOnUsername userRef={comment.commenter}>
          <CommenterName>{comment.commenter?.username ?? '<unknown>'}</CommenterName>
        </HoverCardOnUsername>
      )}
      <CommentText dangerouslySetInnerHTML={{ __html: comment.comment }} />
      {timeAgo && <TimeAgoText>{timeAgo}</TimeAgoText>}
    </HStack>
  );
}
const TimeAgoText = styled.div`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 10px;
  line-height: 1;
  font-weight: 400;

  color: ${colors.metal};
`;

const CommenterName = styled.a`
  font-family: ${BODY_FONT_FAMILY};
  vertical-align: bottom;
  font-size: 12px;
  line-height: 1;
  font-weight: 700;

  text-decoration: none;
  color: ${colors.black['800']};
`;

const CommentText = styled.div`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 1;
  font-weight: 400;

  flex-shrink: 1;
  min-width: 0;
  white-space: pre-line;
`;
