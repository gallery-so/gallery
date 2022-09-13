import { HStack, VStack } from 'components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from 'components/core/Text/Text';
import styled from 'styled-components';
import colors from 'components/core/colors';

export function CommentSection() {
  return (
    <VStack shrink gap={8}>
      <HStack gap={4} align="flex-end">
        <CommenterName>robin</CommenterName>
        <CommentText>
          so aesthetic so aesthetic so aesthetic so aesthetic so aesthetic so aesthetic so aesthetic
          so aesthetic{' '}
        </CommentText>
        <TimeAgoText>2m</TimeAgoText>
      </HStack>

      <HStack gap={4} align="flex-end">
        <CommenterName>kaito</CommenterName>
        <CommentText>i have a few of those ornaments</CommentText>
        <TimeAgoText>18h</TimeAgoText>
      </HStack>

      <AdmirersCountText>+11 others</AdmirersCountText>
    </VStack>
  );
}

const AdmirersCountText = styled.div`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 10px;
  line-height: 1;
  font-weight: 400;

  text-decoration: underline;

  color: ${colors.shadow};
`;

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
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
