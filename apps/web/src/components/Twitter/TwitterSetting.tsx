import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { TWITTER_AUTH_URL } from '~/constants/twitter';
import { TwitterSettingFragment$key } from '~/generated/TwitterSettingFragment.graphql';
import { TwitterSettingMutation } from '~/generated/TwitterSettingMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import TwitterIcon from '~/icons/Twittericon';

import { Button } from '../core/Button/Button';
import colors from '../core/colors';
import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
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

  const [updateTwitterDisplay] = usePromisifiedMutation<TwitterSettingMutation>(graphql`
    mutation TwitterSettingMutation($input: UpdateSocialAccountDisplayedInput!) {
      updateSocialAccountDisplayed(input: $input) {
        __typename

        ... on UpdateSocialAccountDisplayedPayload {
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
      }
    }
  `);

  const handleUpdateTwitterDisplay = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const displayed = event.target.checked;
      updateTwitterDisplay({
        variables: {
          input: {
            displayed,
            type: 'Twitter',
          },
        },
      });
    },
    [updateTwitterDisplay]
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

          <Toggle
            checked={twitterAccount?.display || false}
            onChange={handleUpdateTwitterDisplay}
          />
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

        <StyledConnectLink href={TWITTER_AUTH_URL} target="_self">
          <Button variant="secondary">CONNECT</Button>
        </StyledConnectLink>
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

const StyledConnectLink = styled(InteractiveLink)`
  text-decoration: none;
`;
