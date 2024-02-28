import { useRouter } from 'next/router';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
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

export function OnboardingAddEmailPage() {
  const [email, setEmail] = useState('');

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

  return (
    <VStack>
      <FullPageCenteredStep from={0} to={10}>
        <Container gap={16}>
          <TitleDiatypeM>Add email</TitleDiatypeM>

          <HStack gap={16} align="center">
            <Suspense
              fallback={
                <>
                  <StyledInput value={email} disabled />
                  <Button
                    eventElementId="Save Email Button"
                    eventName="Save Email"
                    eventContext={contexts.Onboarding}
                    variant="primary"
                    disabled
                  >
                    Submit
                  </Button>
                </>
              }
            >
              <SubmitEmailButton
                emailAddress={email}
                onSubmit={handleContinue}
                onEmailChange={setEmail}
              />
            </Suspense>
          </HStack>

          <StyledText color={colors.shadow} shouldShow={!isInvalidEmail}>
            You will receive an email with a link to verify your account
          </StyledText>
        </Container>
      </FullPageCenteredStep>
      <OnboardingFooter step={'add-email'} isNextEnabled previousTextOverride="Back" />
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

type EmailInputProps = {
  emailAddress: string;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
};

function SubmitEmailButton({ emailAddress, onEmailChange, onSubmit }: EmailInputProps) {
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

  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const { pushToast } = useToastActions();

  const isInvalidEmail = useMemo(() => {
    return !EMAIL_FORMAT.test(emailAddress);
  }, [emailAddress]);

  const handleSubmit = useCallback(() => {
    setIsCheckingEmail(true);
    setFinalizedEmail(emailAddress);
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
  }, [emailAddress, isInvalidEmail, pushToast, query.isEmailAddressAvailable, onSubmit]);

  const handleEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onEmailChange(event.target.value);
    },
    [onEmailChange]
  );

  return (
    <>
      <StyledInput onChange={handleEmailChange} placeholder="Email address" autoFocus />
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
    </>
  );
}
