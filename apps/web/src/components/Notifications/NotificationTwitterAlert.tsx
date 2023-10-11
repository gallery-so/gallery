import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { TWITTER_AUTH_URL, TWITTER_LOCAL_STORAGE_KEY } from '~/constants/twitter';
import { NotificationTwitterAlertFragment$key } from '~/generated/NotificationTwitterAlertFragment.graphql';
import CloseIcon from '~/icons/CloseIcon';
import InfoCircleIcon from '~/icons/InfoCircleIcon';
import colors from '~/shared/theme/colors';
import useExperience from '~/utils/graphql/experiences/useExperience';

import GalleryLink from '../core/GalleryLink/GalleryLink';
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

  const router = useRouter();

  const [isTwitterConnectionOnboardingUpsellExperienced, updateTwitterOnboardingExperience] =
    useExperience({
      type: 'TwitterConnectionOnboardingUpsell',
      queryRef: query,
    });

  const twitterAccount = query.viewer?.user?.socialAccounts?.twitter;

  const handleDismiss = useCallback(async () => {
    await updateTwitterOnboardingExperience({ experienced: true });
  }, [updateTwitterOnboardingExperience]);

  const handleConnect = useCallback(() => {
    const route = {
      query: { ...router.query, twitter: 'true' },
      pathname: router.pathname,
    };
    localStorage.setItem(TWITTER_LOCAL_STORAGE_KEY, JSON.stringify(route));
  }, [router.pathname, router.query]);

  if (twitterAccount || isTwitterConnectionOnboardingUpsellExperienced) {
    return null;
  }

  return (
    <StyledAlertContainer>
      <StyledAlert align="center" gap={8}>
        <StyledInfoCircleIcon />
        <BaseM>Connect Twitter to find friends and display your handle.</BaseM>
        <HStack align="center" gap={8}>
          <GalleryLink onClick={handleConnect} href={TWITTER_AUTH_URL} target="_self">
            Connect
          </GalleryLink>
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
