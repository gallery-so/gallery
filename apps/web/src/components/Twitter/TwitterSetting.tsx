import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { TWITTER_AUTH_URL } from '~/constants/twitter';
import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { TwitterSettingDisconnectMutation } from '~/generated/TwitterSettingDisconnectMutation.graphql';
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
            id
            user {
              username
            }
            socialAccounts {
              twitter {
                username
                display
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
                  display
                }
              }
            }
          }
        }
      }
    }
  `);

  const [updateTwitterDisplay] = usePromisifiedMutation<TwitterSettingMutation>(graphql`
    mutation TwitterSettingMutation($input: UpdateSocialAccountDisplayedInput!) {
      updateSocialAccountDisplayed(input: $input) {
        __typename
        ... on UpdateSocialAccountDisplayedPayload {
          viewer {
            ... on Viewer {
              __typename
              id
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

  const handleUpdateTwitterDisplay = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const displayed = event.target.checked;

      const optimisticResponse: TwitterSettingMutation['response'] = {
        updateSocialAccountDisplayed: {
          __typename: 'UpdateSocialAccountDisplayedPayload',
          viewer: {
            __typename: 'Viewer',
            id: query.viewer?.id ?? '',
            socialAccounts: {
              twitter: {
                username: query.viewer?.socialAccounts?.twitter?.username ?? '',
                display: displayed,
              },
            },
          },
        },
      };

      updateTwitterDisplay({
        variables: {
          input: {
            displayed,
            type: 'Twitter',
          },
        },
        optimisticResponse,
      });
    },
    [query.viewer?.id, query.viewer?.socialAccounts?.twitter?.username, updateTwitterDisplay]
  );

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

          <Button onClick={handleDisconnectTwitter} variant="secondary">
            DISCONNECT
          </Button>
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
