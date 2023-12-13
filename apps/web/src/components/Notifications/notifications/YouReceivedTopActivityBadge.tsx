import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import TopActivityBadgeIcon from '~/icons/TopActivityBadgeIcon';
import colors from '~/shared/theme/colors';

export default function YouReceivedTopActivityBadge() {
  return (
    <StyledNotificationContent align="center" justify="space-between" gap={8}>
      <HStack align="center" gap={8}>
        <StyledIconWrapper align="center" justify="center">
          <TopActivityBadgeIcon />
        </StyledIconWrapper>
        <StyledTextWrapper align="center" as="span" wrap="wrap">
          <BaseM as="span">
            You received a new badge for being amongst the top active users on Gallery this week!
          </BaseM>
        </StyledTextWrapper>
      </HStack>
    </StyledNotificationContent>
  );
}

const StyledNotificationContent = styled(HStack)`
  width: 100%;
`;

const StyledTextWrapper = styled(HStack)`
  display: inline;
  flex: 1;
`;

const StyledIconWrapper = styled(VStack)`
  height: 32px;
  width: 32px;
  border-radius: 50%;
  border: 1px solid ${colors.activeBlue};
`;
