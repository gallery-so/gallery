import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { TwitterSettingFragment$key } from '~/generated/TwitterSettingFragment.graphql';
import TwitterIcon from '~/icons/Twittericon';

import { Button } from '../core/Button/Button';
import colors from '../core/colors';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import Toggle from '../core/Toggle/Toggle';

type Props = {
  queryRef: TwitterSettingFragment$key;
};

export default function TwitterSetting({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment TwitterSettingFragment on Query {
        viewer {
          ... on Viewer {
            user {
              socialAccounts {
                twitter {
                  username
                  display
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const twitterAccount = query.viewer?.user?.socialAccounts?.twitter;

  if (twitterAccount) {
    return (
      <StyledTwitterSettingContainer gap={12}>
        <HStack align="center" justify="space-between">
          <HStack gap={5} align="center">
            <TwitterIcon />
            <BaseM>
              <strong>{twitterAccount?.username}</strong>
            </BaseM>
          </HStack>

          <Button variant="secondary">DISCONNECT</Button>
        </HStack>
        <StyledDivider />
        <HStack align="center" justify="space-between">
          <BaseM>
            <strong>Display on profile</strong>
          </BaseM>

          <Toggle checked={twitterAccount?.display || false} onChange={() => {}} />
        </HStack>
      </StyledTwitterSettingContainer>
    );
  }

  return (
    <StyledTwitterSettingContainer>
      <HStack align="center" justify="space-between" gap={12}>
        <BaseM>
          Connect your Twitter account to find friends and display your handle on your profile.
        </BaseM>

        <Button variant="secondary">CONNECT</Button>
      </HStack>
    </StyledTwitterSettingContainer>
  );
}

const StyledTwitterSettingContainer = styled(VStack)`
  padding: 12px;
  background-color: ${colors.offWhite};
`;

const StyledDivider = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${colors.porcelain};
`;
