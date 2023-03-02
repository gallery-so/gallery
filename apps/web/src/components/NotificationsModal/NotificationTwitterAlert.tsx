import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { TWITTER_AUTH_URL, TWITTER_LOCAL_STORAGE_KEY } from '~/constants/twitter';
import { NotificationTwitterAlertFragment$key } from '~/generated/NotificationTwitterAlertFragment.graphql';
import CloseIcon from '~/icons/CloseIcon';
import InfoCircleIcon from '~/icons/InfoCircleIcon';
import useExperience from '~/utils/graphql/experiences/useExperience';

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

        ...useExperienceFragment
      }
    `,
    queryRef
  );

  const [isTwitterConnectionOnboardingUpsellExperienced, updateTwitterOnboardingExperience] =
    useExperience({
      type: 'TwitterConnectionOnboardingUpsell',
      queryRef: query,
    });

  const twitterAccount = query.viewer?.user?.socialAccounts?.twitter;

  const handleDismiss = useCallback(async () => {
    await updateTwitterOnboardingExperience({ experienced: true });
  }, [updateTwitterOnboardingExperience]);

  const router = useRouter();
  const route = {
    query: router.query,
    pathname: router.pathname,
  };

  if (twitterAccount || isTwitterConnectionOnboardingUpsellExperienced) {
    return null;
  }

  // Save the current route to localStorage so we can redirect back to it after
  localStorage.setItem(TWITTER_LOCAL_STORAGE_KEY, JSON.stringify(route));

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
  color: ${colors.red};
`;
