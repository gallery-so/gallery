import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CommentLineFragment$key } from '__generated__/CommentLineFragment.graphql';
import { HStack } from 'components/core/Spacer/Stack';
import styled from 'styled-components';
import { BODY_FONT_FAMILY } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { useEffect, useState } from 'react';
import { getTimeSince } from 'utils/time';

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
        }
      }
    `,
    commentRef
  );

  const [, setCount] = useState(0);
  useEffect(function rerenderEveryFewSecondsToUpdateTimeAgo() {
    const intervalId = setInterval(() => {
      setCount((previous) => previous + 1);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const timeAgo = comment.creationTime ? getTimeSince(comment.creationTime) : null;

  return (
    <HStack key={comment.dbid} gap={4} align="flex-start">
      <CommenterName>{comment.commenter?.username ?? '<unknown>'}</CommenterName>
      <CommentText>{comment.comment}</CommentText>
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

const CommenterName = styled.div`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 1;
  font-weight: 700;
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
