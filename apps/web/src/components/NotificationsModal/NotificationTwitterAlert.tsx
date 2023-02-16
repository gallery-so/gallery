import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { ENABLE_TWITTER_DISMISSED_KEY } from '~/constants/storageKeys';
import { TWITTER_AUTH_URL } from '~/constants/twitter';
import { NotificationTwitterAlertFragment$key } from '~/generated/NotificationTwitterAlertFragment.graphql';
import usePersistedState from '~/hooks/usePersistedState';
import CloseIcon from '~/icons/CloseIcon';
import InfoCircleIcon from '~/icons/InfoCircleIcon';

import colors from '../core/colors';
import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import { HStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';

type Props = {
  queryRef: NotificationTwitterAlertFragment$key;
};

export function NotificationTwitterAlert({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment NotificationTwitterAlertFragment on Query {
        viewer {
          ... on Viewer {
            user {
              socialAccounts {
                twitter {
                  __typename
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

  const [twitterDismissed, setTwitterDismissed] = usePersistedState(
    ENABLE_TWITTER_DISMISSED_KEY,
    false
  );

  const handleDismiss = useCallback(() => {
    setTwitterDismissed(true);
  }, [setTwitterDismissed]);

  if (twitterAccount || twitterDismissed) {
    return null;
  }

  return (
    <StyledAlertContainer>
      <StyledAlert align="center" gap={8}>
        <StyledInfoCircleIcon />
        <BaseM>Connect Twitter to find friends and display your handle.</BaseM>
        <HStack align="center" gap={8}>
          <InteractiveLink href={TWITTER_AUTH_URL} target="_self">
            Connect
          </InteractiveLink>
          <IconContainer variant="default" size="sm" onClick={handleDismiss} icon={<CloseIcon />} />
        </HStack>
      </StyledAlert>
    </StyledAlertContainer>
  );
}

const StyledAlertContainer = styled(HStack)`
  padding: 4px 12px;
`;

const StyledAlert = styled(HStack)`
  border: 1px solid ${colors.activeBlue};
  padding: 8px 12px;
`;

const StyledInfoCircleIcon = styled(InfoCircleIcon)`
  height: 24px;
  width: 24px;
  color: red;
`;
