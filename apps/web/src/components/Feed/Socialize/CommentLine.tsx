import { useEffect, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import Markdown from '~/components/core/Markdown/Markdown';
import { HStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { CommentLineFragment$key } from '~/generated/CommentLineFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { replaceUrlsWithMarkdownFormat } from '~/shared/utils/replaceUrlsWithMarkdownFormat';
import { getTimeSince } from '~/shared/utils/time';
import unescape from '~/shared/utils/unescape';

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
    <HStack key={comment.dbid} gap={4}>
      {comment.commenter && (
        <StyledUsernameWrapper>
          <UserHoverCard userRef={comment.commenter}>
            <CommenterName>{comment.commenter?.username ?? '<unknown>'}</CommenterName>
          </UserHoverCard>
        </StyledUsernameWrapper>
      )}
      <CommentText>
        <Markdown
          text={unescape(replaceUrlsWithMarkdownFormat(comment.comment ?? ''))}
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
  line-height: 1;
  font-weight: 700;

  text-decoration: none;
  color: ${colors.black['800']};
`;

const CommentText = styled.div`
  word-wrap: break-word;
  word-break: break-all;
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
