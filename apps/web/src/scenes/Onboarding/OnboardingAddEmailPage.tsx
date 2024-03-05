import { useRouter } from 'next/router';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import useDebounce from 'shared/hooks/useDebounce';
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

import { OnboardingContainer } from './style';

const onboardingStepName = 'add-email';

export function OnboardingAddEmailPage() {
  const [email, setEmail] = useState('');
  const debouncedEmail = useDebounce(email, 500);

  const { push, query: queryRouter } = useRouter();
  const { query: routerQuery } = useRouter();
  const authMechanismType = routerQuery.authMechanismType;

  const isInvalidEmail = useMemo(() => {
    return !EMAIL_FORMAT.test(email);
  }, [email]);

  const handleContinue = useCallback(async () => {
    if (authMechanismType === 'eoa') {
      push({
        pathname: '/onboarding/add-username',
        query: {
          ...queryRouter,
          email,
        },
      });
    }
  }, [authMechanismType, email, push, queryRouter]);

  const handlePrevious = useCallback(() => {
    push('/');
  }, [push]);

  const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  return (
    <VStack>
      <FullPageCenteredStep stepName={onboardingStepName}>
        <OnboardingContainer>
          <TitleDiatypeM>Add email</TitleDiatypeM>

          <HStack gap={16} align="center">
            <StyledInput onChange={handleEmailChange} placeholder="Email address" autoFocus />

            <Suspense
              fallback={
                <Button
                  eventElementId="Save Email Button"
                  eventName="Save Email"
                  eventContext={contexts.Onboarding}
                  variant="primary"
                  disabled
                >
                  Submit
                </Button>
              }
            >
              <SubmitEmailButton emailAddress={debouncedEmail} onSubmit={handleContinue} />
            </Suspense>
          </HStack>

          <StyledText color={colors.shadow} shouldShow={!isInvalidEmail}>
            You will receive an email with a link to verify your account
          </StyledText>
        </OnboardingContainer>
      </FullPageCenteredStep>
      <OnboardingFooter
        step={onboardingStepName}
        isNextEnabled
        previousTextOverride="Back"
        onPrevious={handlePrevious}
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

const StyledText = styled(BaseM)<{ shouldShow?: boolean }>`
  opacity: ${({ shouldShow }) => (shouldShow ? 1 : 0)};
`;

type SubmitEmailButtonProps = {
  emailAddress: string;
  onSubmit: () => void;
};

function SubmitEmailButton({ emailAddress, onSubmit }: SubmitEmailButtonProps) {
  const query = useLazyLoadQuery<OnboardingAddEmailPageQuery>(
    graphql`
      query OnboardingAddEmailPageQuery($emailAddress: Email!) {
        isEmailAddressAvailable(emailAddress: $emailAddress)
      }
    `,
    {
      emailAddress,
    }
  );

  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const { pushToast } = useToastActions();

  const isInvalidEmail = useMemo(() => {
    return !EMAIL_FORMAT.test(emailAddress);
  }, [emailAddress]);

  const handleSubmit = useCallback(() => {
    setIsCheckingEmail(true);
    if (isInvalidEmail) {
      pushToast({
        message: "That doesn't look like a valid email address. Please double-check and try again",
      });
      setIsCheckingEmail(false);
      return;
    }

    const isEmailAddressAvailable = query.isEmailAddressAvailable ?? false;

    if (!isEmailAddressAvailable) {
      pushToast({
        message: 'This email address is already in use',
      });
      setIsCheckingEmail(false);
      return;
    }

    onSubmit();
    setIsCheckingEmail(false);
  }, [isInvalidEmail, pushToast, query.isEmailAddressAvailable, onSubmit]);

  return (
    <Button
      eventElementId="Save Email Button"
      eventName="Save Email"
      eventContext={contexts.Onboarding}
      variant="primary"
      disabled={isCheckingEmail}
      onClick={handleSubmit}
    >
      Submit
    </Button>
  );
}
