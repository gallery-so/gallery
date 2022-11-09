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

  const { push, back } = useRouter();

  const username = query?.viewer?.user?.username;
  const savedEmail = query?.viewer?.email?.email;

  if (!username) {
    throw new Error(`AddEmail expected non-null username, but got: ${username}`);
  }

  const userGalleryRoute: Route = useMemo(
    () => ({ pathname: '/[username]', query: { username } }),
    [username]
  );

  const handleNext = useCallback(() => {
    // track('');
    push(userGalleryRoute);
  }, [push, userGalleryRoute]);

  return (
    <VStack>
      <FullPageCenteredStep>
        <VStack gap={16}>
          <TitleL>Welcome to Gallery</TitleL>
          <VStack>
            <TitleDiatypeL>Never miss a moment</TitleDiatypeL>
            <StyledBodyText>
              Receive weekly emails that recap your most recent admires, comments, and followers.
              You can always change this later in account settings.
            </StyledBodyText>
          </VStack>
          <EmailManager queryRef={query} />
        </VStack>
      </FullPageCenteredStep>
      <OnboardingFooter
        step={'add-email'}
        onNext={handleNext}
        previousTextOverride="Skip"
        isNextEnabled={!!savedEmail}
        onPrevious={back}
      />
    </VStack>
  );
}

const StyledBodyText = styled(BaseM)`
  max-width: 400px;
`;
