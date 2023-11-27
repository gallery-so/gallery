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

type CommentLineProps = {
  commentRef: CommentLineFragment$key;
};

export function CommentLine({ commentRef }: CommentLineProps) {
  const comment = useFragment(
    graphql`
      fragment CommentLineFragment on Comment {
        dbid

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

  const nonNullMentions = useMemo(() => removeNullValues(comment.mentions), [comment.mentions]);

  return (
    <HStack inline key={comment.dbid} gap={4}>
      <CommentText>
        {comment.commenter && (
          <StyledUsernameWrapper>
            <UserHoverCard userRef={comment.commenter}>
              <CommenterName>{comment.commenter?.username ?? '<unknown>'}</CommenterName>
            </UserHoverCard>
          </StyledUsernameWrapper>
        )}
        <ProcessedText
          text={comment.comment}
          mentionsRef={nonNullMentions}
          eventContext={contexts.Posts}
        />
      </CommentText>
    </HStack>
  );
}

const StyledUsernameWrapper = styled.div`
  line-height: 16px;
  height: fit-content;
  display: inline-grid;
  margin-right: 4px;
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
