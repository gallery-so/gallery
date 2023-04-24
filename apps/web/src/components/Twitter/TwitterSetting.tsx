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

import { Button } from '../core/Button/Button';
import colors from '~/shared/theme/colors';
import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import Toggle from '../core/Toggle/Toggle';
import useUpdateTwitterDisplay from './useUpdateTwitterDisplay';

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
                display
              }
            }
          }
        }

        ...useUpdateTwitterDisplayFragment
      }
    `,
    queryRef
  );

  const updateTwitterDisplay = useUpdateTwitterDisplay(query);

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
      updateTwitterDisplay(displayed);
    },
    [updateTwitterDisplay]
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
          <StyledConnectButton variant="secondary">CONNECT</StyledConnectButton>
        </StyledConnectLink>
      </HStack>
    </StyledTwitterSettingContainer>
  );
}

const StyledTwitterSettingContainer = styled(VStack)`
  padding: 12px;
  background-color: ${colors.faint};
`;

const StyledDivider = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${colors.porcelain};
`;

const StyledConnectLink = styled(InteractiveLink)`
  text-decoration: none;
`;

const StyledConnectButton = styled(Button)`
  width: 84px;
`;
