import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import CloseIcon from '~/icons/CloseIcon';
import colors from '~/shared/theme/colors';

type Props = {
  username: string;
  comment: string;
  onClose: () => void;
};

export function CommentRepliedBanner({ username, comment, onClose }: Props) {
  if (!username || !comment) {
    return null;
  }

  return (
    <StyledWrapper gap={6}>
      <HStack align="center" justify="space-between">
        <StyledCommentAuthor>Replying to {username}</StyledCommentAuthor>
        <IconContainer
          onClick={onClose}
          size="xs"
          variant="stacked"
          icon={<CloseIcon size={16} />}
        />
      </HStack>
      <StyledCommentText>{comment}</StyledCommentText>
    </StyledWrapper>
  );
}

const StyledWrapper = styled(VStack)`
  padding: 8px 16px;
  background-color: ${colors.faint};
`;

const StyledCommentAuthor = styled(BaseM)`
  font-weight: 700;
  color: ${colors.shadow};
`;
const StyledCommentText = styled(BaseM)`
  color: ${colors.shadow};
`;
