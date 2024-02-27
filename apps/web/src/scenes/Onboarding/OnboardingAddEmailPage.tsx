import { useRouter } from 'next/router';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import { useTrack } from 'shared/contexts/AnalyticsContext';
import { useReportError } from 'shared/contexts/ErrorReportingContext';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { OnboardingAddEmailPageQuery } from '~/generated/OnboardingAddEmailPageQuery.graphql';
import { EMAIL_FORMAT } from '~/shared/utils/regex';

const FALLBACK_ERROR_MESSAGE = `Something unexpected went wrong while logging in. We've been notified and are looking into it`;

export function InnerOnboardingAddEmailPage() {
  const [email, setEmail] = useState('');

  const [finalizedEmail, setFinalizedEmail] = useState('');
  const query = useLazyLoadQuery<OnboardingAddEmailPageQuery>(
    graphql`
      query OnboardingAddEmailPageQuery($emailAddress: Email!) {
        isEmailAddressAvailable(emailAddress: $emailAddress)
      }
    `,
    {
      emailAddress: finalizedEmail,
    }
  );
  const { push, query: queryRouter } = useRouter();
  const { pushToast } = useToastActions();
  const { query: routerQuery } = useRouter();
  const authMechanismType = routerQuery.authMechanismType;

  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const reportError = useReportError();
  const track = useTrack();

  const isInvalidEmail = useMemo(() => {
    return !EMAIL_FORMAT.test(email);
  }, [email]);

  const handleEmailChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setEmail(event.target.value);
  }, []);

  const handleContinue = useCallback(async () => {
    function handleLoginError({
      message,
      underlyingError,
    }: {
      message: string;
      underlyingError?: Error;
    }) {
      track('Sign In Failure', { 'Sign in method': 'Email', error: message });

      if (underlyingError) {
        reportError(underlyingError);
      } else {
        reportError(`LoginError: ${message}`);
      }

      setError(message);

      pushToast({
        message,
      });
    }

    if (isInvalidEmail) {
      pushToast({
        message: "That doesn't look like a valid email address. Please double-check and try again",
      });
      setIsLoggingIn(false);
      return;
    }

    setFinalizedEmail(email);

    let isEmailAddressAvailable = false;

    isEmailAddressAvailable = query.isEmailAddressAvailable ?? false;

    // If it's a wallet auth mechanism, we need to check if the email is available
    if (authMechanismType === 'eoa') {
      try {
        if (!isEmailAddressAvailable) {
          setError('This email address is already in use');
          setIsLoggingIn(false);
          return;
        }
      } catch (error) {
        handleLoginError({ message: FALLBACK_ERROR_MESSAGE, underlyingError: error as Error });
        return;
      }
    }

    try {
      if (authMechanismType === 'eoa') {
        push({
          pathname: '/onboarding/add-username',
          query: {
            ...queryRouter,
            email: finalizedEmail,
          },
        });
      }
    } catch (error) {}
  }, [
    authMechanismType,
    email,
    finalizedEmail,
    isInvalidEmail,
    query.isEmailAddressAvailable,
    push,
    pushToast,
    queryRouter,
    reportError,
    track,
  ]);

  return (
    <VStack>
      <FullPageCenteredStep from={0} to={10}>
        <Container gap={16}>
          <TitleDiatypeM>Add email</TitleDiatypeM>

          <HStack gap={16} align="center">
            <StyledInput onChange={handleEmailChange} placeholder="Email address" autoFocus />

            <Button
              eventElementId="Save Email Button"
              eventName="Save Email"
              eventContext={contexts.Onboarding}
              variant="primary"
              disabled={isLoggingIn}
              onClick={handleContinue}
            >
              Submit
            </Button>
          </HStack>

          <StyledText color={colors.shadow} shouldShow={!isInvalidEmail && !error}>
            You will receive an email with a link to verify your account
          </StyledText>
        </Container>
      </FullPageCenteredStep>
      <OnboardingFooter
        step={'add-email'}
        onNext={() => {}}
        isNextEnabled
        previousTextOverride="Back"
      />
    </VStack>
  );
}

const StyledInput = styled.input`
  border: 0;
  background-color: ${colors.faint};
  padding: 6px 12px;
  width: 300px;
  height: 32px;
`;

const Container = styled(VStack)`
  width: 480px;
`;

const StyledText = styled(BaseM)<{ shouldShow?: boolean }>`
  opacity: ${({ shouldShow }) => (shouldShow ? 1 : 0)};
`;

export function OnboardingAddEmailPage() {
  return (
    <Suspense fallback={null}>
      <InnerOnboardingAddEmailPage />
    </Suspense>
  );
}
