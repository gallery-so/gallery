import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL, TitleL } from '~/components/core/Text/Text';
import EmailManager from '~/components/Email/EmailManager';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';
import { addEmailQuery } from '~/generated/addEmailQuery.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

export default function AddEmail() {
  const query = useLazyLoadQuery<addEmailQuery>(
    graphql`
      query addEmailQuery {
        viewer {
          ... on Viewer {
            __typename
            user {
              username
            }
            email {
              email
            }
          }
        }
        ...EmailManagerFragment
      }
    `,
    {}
  );

  if (query.viewer?.__typename !== 'Viewer') {
    throw new Error(
      `AddEmail expected Viewer to be type 'Viewer' but got: ${query.viewer?.__typename}`
    );
  }

  const track = useTrack();
  const { push } = useRouter();

  const savedEmail = query?.viewer?.email?.email;
  const username = query?.viewer?.user?.username;

  const userProfileRoute: Route = useMemo(
    () => ({
      pathname: '/[username]',
      query: {
        username: `${username as string}`,
        onboarding: 'true',
      },
    }),
    [username]
  );

  const handleNext = useCallback(() => {
    track('Onboarding: add-email Done click');

    push(userProfileRoute);
  }, [push, track, userProfileRoute]);

  const handleSkip = useCallback(() => {
    track('Onboarding: add-email Skip click');
    push(userProfileRoute);
  }, [push, track, userProfileRoute]);

  return (
    <VStack>
      <FullPageCenteredStep>
        <VStack gap={16}>
          <TitleL>Welcome to Gallery</TitleL>
          <VStack>
            <TitleDiatypeL>Never miss a moment</TitleDiatypeL>
            <StyledBodyText>
              Receive weekly emails that recap product updates, airdrop opportunities, and your most
              recent gallery admirers. You can always change this later in account settings.
            </StyledBodyText>
          </VStack>
          <StyledEmailManagerContainer>
            <EmailManager queryRef={query} />
          </StyledEmailManagerContainer>
        </VStack>
      </FullPageCenteredStep>
      <OnboardingFooter
        step={'add-email'}
        onNext={handleNext}
        isNextEnabled={Boolean(savedEmail)}
        // lightly enforce restriction to add an email
        // previousTextOverride="Skip"
        // onPrevious={handleSkip}
      />
    </VStack>
  );
}

const StyledBodyText = styled(BaseM)`
  max-width: 400px;
`;

const StyledEmailManagerContainer = styled.div`
  height: 72px;
`;
