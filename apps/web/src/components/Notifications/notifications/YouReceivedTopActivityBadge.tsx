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

export function TopMemberBadge() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g clip-path="url(#clip0_1369_15132)">
        <path
          d="M17.06 13.3398L20.5 19.4998H17L15.5 22.4998L12 16.4998L8.5 22.4998L7 19.4998H3.5L6.94 13.3398"
          fill="#0022F0"
        />
        <path
          d="M17.06 13.3398L20.5 19.4998H17L15.5 22.4998L12 16.4998L8.5 22.4998L7 19.4998H3.5L6.94 13.3398"
          stroke="#FEFEFE"
        />
        <path
          d="M12 15.5C15.866 15.5 19 12.366 19 8.5C19 4.63401 15.866 1.5 12 1.5C8.13401 1.5 5 4.63401 5 8.5C5 12.366 8.13401 15.5 12 15.5Z"
          fill="#0022F0"
          stroke="#FEFEFE"
        />
        <path
          d="M14.4472 9.66909C14.4472 8.92503 14.5602 8.7333 15 8.69944V8.29397H11.8434V8.69944C12.9142 8.74472 13.4784 8.61775 13.4784 9.54593L13.4818 11.0273C13.4293 11.2142 13.3486 11.392 13.2427 11.5546C13.0111 11.8932 12.6277 12.0507 12.1096 12.0507C10.8822 12.0507 10.1559 10.7547 10.1559 8.52294C10.1559 6.29117 10.8251 4.96345 12.1659 4.96345C13.2029 4.96345 13.8272 5.64826 13.9859 7.09068H14.4481V4.64348H14.0083C13.952 4.92536 13.9067 5.00408 13.8052 5.00408C13.6253 5.00408 13.1246 4.5 12.1219 4.5C10.2401 4.5 9 6.18748 9 8.56527C9 10.9655 10.1851 12.5205 12.1321 12.5205H12.1359C13.2841 12.5205 13.6507 11.7544 13.7286 11.5102L14.0041 12.4193H14.4438L14.4472 9.66909Z"
          fill="#FEFEFE"
        />
      </g>
      <defs>
        <clipPath id="clip0_1369_15132">
          <rect width="24" height="23" fill="white" transform="translate(0 0.5)" />
        </clipPath>
      </defs>
    </svg>
  );
}
