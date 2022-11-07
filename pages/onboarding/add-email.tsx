import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { ButtonLink } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseXL, TitleDiatypeL, TitleL } from '~/components/core/Text/Text';
import EmailForm from '~/components/Email/EmailForm';
import EmailManager from '~/components/Email/EmailManager';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';

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

  const { push, back, query: urlQuery } = useRouter();

  const username = query?.viewer?.user?.username;
  console.log(username);

  const handleNext = useCallback(() => {
    // track('');

    push({
      pathname: '/onboarding/organize-collection',
      query: { ...query },
    });
  }, []);

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
        // isNextEnabled={}
        onPrevious={back}
      />
    </VStack>
  );
}

const StyledBodyText = styled(BaseM)`
  max-width: 400px;
`;

const FixedWidthButtonLink = styled(ButtonLink)`
  min-width: 200px;
`;
