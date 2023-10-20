import { useEffect, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
import { CommentLineFragment$key } from '~/generated/CommentLineFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
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
          ...UserHoverCardFragment
        }
        mentions {
          ...ProcessedTextFragment
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
  const nonNullMentions = useMemo(() => removeNullValues(comment.mentions), [comment.mentions]);

  return (
    <HStack inline key={comment.dbid} gap={4} justify="center">
      {comment.commenter && (
        <StyledUsernameWrapper>
          <UserHoverCard userRef={comment.commenter}>
            <CommenterName>{comment.commenter?.username ?? '<unknown>'}</CommenterName>
          </UserHoverCard>
        </StyledUsernameWrapper>
      )}
      <CommentText>
        <ProcessedText
          text={comment.comment}
          mentionsRef={nonNullMentions}
          eventContext={contexts.Posts}
        />
      </CommentText>
      {timeAgo && <TimeAgoText>{timeAgo}</TimeAgoText>}
    </HStack>
  );
}
const TimeAgoText = styled.div`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 10px;
  line-height: 18px;
  font-weight: 400;

  color: ${colors.metal};
`;

const StyledUsernameWrapper = styled.div`
  line-height: 16px;
  height: fit-content;
`;

const CommenterName = styled.span`
  font-family: ${BODY_FONT_FAMILY};
  vertical-align: bottom;
  font-size: 14px;
  font-weight: 700;

  text-decoration: none;
  color: ${colors.black['800']};
`;

const CommentText = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;

  font-family: ${BODY_FONT_FAMILY};
  font-size: 14px;
  line-height: 18px;
  font-weight: 400;

  flex-shrink: 1;
  min-width: 0;
  white-space: pre-line;
`;
