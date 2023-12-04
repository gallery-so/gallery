import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import colors from '~/shared/theme/colors';

export default function YouReceivedTopActivityBadge() {
  return (
    <StyledNotificationContent align="center" justify="space-between" gap={8}>
      <HStack align="center" gap={8}>
        <StyledIconWrapper align="center" justify="center">
          <TopMemberBadge />
        </StyledIconWrapper>
        <StyledTextWrapper align="center" as="span" wrap="wrap">
          <BaseM as="span">
            You've earned a new badge as one of the top 60 active members on Gallery!
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

function TopMemberBadge() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z"
        stroke="#0022F0"
      />
      <path
        d="M14.4472 9.16909C14.4472 8.42503 14.5602 8.2333 15 8.19944V7.79397H11.8434V8.19944C12.9142 8.24472 13.4784 8.11775 13.4784 9.04593L13.4818 10.5273C13.4293 10.7142 13.3486 10.892 13.2427 11.0546C13.0111 11.3932 12.6277 11.5507 12.1096 11.5507C10.8822 11.5507 10.1559 10.2547 10.1559 8.02294C10.1559 5.79117 10.8251 4.46345 12.1659 4.46345C13.2029 4.46345 13.8272 5.14826 13.9859 6.59068H14.4481V4.14348H14.0083C13.952 4.42536 13.9067 4.50408 13.8052 4.50408C13.6253 4.50408 13.1246 4 12.1219 4C10.2401 4 9 5.68748 9 8.06527C9 10.4655 10.1851 12.0205 12.1321 12.0205H12.1359C13.2841 12.0205 13.6507 11.2544 13.7286 11.0102L14.0041 11.9193H14.4438L14.4472 9.16909Z"
        fill="#0022F0"
      />
      <path
        d="M17.06 12.8398L20.5 18.9998H17L15.5 21.9998L12 15.9998L8.5 21.9998L7 18.9998H3.5L6.94 12.8398"
        stroke="#0022F0"
      />
    </svg>
  );
}
