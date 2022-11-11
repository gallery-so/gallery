import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { EmailManagerFragment$key } from '~/generated/EmailManagerFragment.graphql';

import EmailForm from './EmailForm';
import EmailVerificationStatus from './EmailVerificationStatus';

type Props = {
  queryRef: EmailManagerFragment$key;
  onClosed?: () => void;
};

function EmailManager({ queryRef, onClosed }: Props) {
  const query = useFragment(
    graphql`
      fragment EmailManagerFragment on Query {
        viewer {
          ... on Viewer {
            email {
              email
              verificationStatus
            }
          }
        }
        ...EmailFormFragment
        ...EmailVerificationStatusFragment
      }
    `,
    queryRef
  );

  const { route } = useRouter();
  const isOnboarding = route === '/onboarding/add-email';

  const savedEmail = query?.viewer?.email?.email;

  const [isEditMode, setIsEditMode] = useState(false);

  const showInput = useMemo(() => {
    return !savedEmail || isEditMode;
  }, [savedEmail, isEditMode]);

  return (
    <StyledEmailManager isOnboarding={isOnboarding}>
      {showInput ? (
        <EmailForm queryRef={query} setIsEditMode={setIsEditMode} onClosed={onClosed} />
      ) : (
        <EmailVerificationStatus queryRef={query} setIsEditMode={setIsEditMode} />
      )}
    </StyledEmailManager>
  );
}

const StyledEmailManager = styled.div<{ isOnboarding: boolean }>`
  height: ${({ isOnboarding }) =>
    isOnboarding
      ? '72px'
      : 'auto'}; // set fixed height to onboarding so changing modes doesnt shift page content
`;

export default EmailManager;
