import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { TWITTER_AUTH_URL } from '~/constants/twitter';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { TwitterSettingDisconnectMutation } from '~/generated/TwitterSettingDisconnectMutation.graphql';
import { TwitterSettingFragment$key } from '~/generated/TwitterSettingFragment.graphql';
import TwitterIcon from '~/icons/TwitterIcon';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import colors from '~/shared/theme/colors';

import { Button } from '../core/Button/Button';
import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';

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
              username
            }
            socialAccounts {
              twitter {
                username
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const [disconnectTwitter] = usePromisifiedMutation<TwitterSettingDisconnectMutation>(graphql`
    mutation TwitterSettingDisconnectMutation($input: SocialAccountType!) {
      disconnectSocialAccount(accountType: $input) {
        __typename

        ... on DisconnectSocialAccountPayload {
          viewer {
            ... on Viewer {
              socialAccounts {
                twitter {
                  username
                }
              }
            }
          }
        }
      }
    }
  `);

  const reportError = useReportError();
  const { pushToast } = useToastActions();

  const handleDisconnectTwitter = useCallback(async () => {
    try {
      await disconnectTwitter({
        variables: {
          input: 'Twitter',
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        reportError(error, { tags: { username: query.viewer?.user?.username } });
        pushToast({
          message: 'Failed to disconnect your Twitter account',
        });
      }
    }
  }, [disconnectTwitter, pushToast, query.viewer?.user?.username, reportError]);

  const twitterAccount = query.viewer?.socialAccounts?.twitter;

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

          <Button
            eventElementId="Disconnect Twitter Button"
            eventName="Disconnect Twitter"
            onClick={handleDisconnectTwitter}
            variant="secondary"
          >
            DISCONNECT
          </Button>
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
          <StyledConnectButton
            eventElementId="Connect Twitter Button"
            eventName="Connect Twitter"
            eventContext="External Social"
            variant="secondary"
          >
            CONNECT
          </StyledConnectButton>
        </StyledConnectLink>
      </HStack>
    </StyledTwitterSettingContainer>
  );
}

const StyledTwitterSettingContainer = styled(VStack)`
  padding: 12px;
  background-color: ${colors.faint};
`;

const StyledConnectLink = styled(InteractiveLink)`
  text-decoration: none;
`;

const StyledConnectButton = styled(Button)`
  width: 84px;
`;
