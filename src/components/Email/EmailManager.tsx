import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { EmailManagerFragment$key } from '~/generated/EmailManagerFragment.graphql';

import EmailForm from './EmailForm';
import EmailVerificationStatus from './EmailVerificationStatus';

type Props = {
  queryRef: EmailManagerFragment$key;
};

function EmailManager({ queryRef }: Props) {
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

  const savedEmail = query?.viewer?.email?.email;

  const [isEditMode, setIsEditMode] = useState(false);

  const showInput = useMemo(() => {
    return !savedEmail || isEditMode;
  }, [savedEmail, isEditMode]);

  return (
    <StyledEmailManager>
      {showInput ? (
        <EmailForm queryRef={query} setIsEditMode={setIsEditMode} />
      ) : (
        <EmailVerificationStatus queryRef={query} setIsEditMode={setIsEditMode} />
      )}
    </StyledEmailManager>
  );
}

const StyledEmailManager = styled.div`
  height: 72px; // set fixed height so changing modes doesnt shift page content
`;

export default EmailManager;
