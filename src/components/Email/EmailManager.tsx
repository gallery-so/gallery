import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '../core/colors';
import EmailForm from './EmailForm';
import EmailVerificationStatus from './EmailVerificationStatus';

// import Input from '../core/Input/Input';

type Props = {
  emailAddress: string;
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
      }
    `,
    queryRef
  );

  // const savedEmail = query.viewer.email?.email;
  const savedEmail = 'test@test.com';

  const [isEditMode, setIsEditMode] = useState(false);

  const showInput = useMemo(() => {
    // Show input only if there's no email address, or the user has opted to edit
    return !savedEmail || isEditMode;
  }, [savedEmail, isEditMode]);

  console.log('showInput', showInput);

  return (
    <StyledEmailManager>
      {showInput ? (
        <EmailForm queryRef={query} savedEmail={savedEmail} setIsEditMode={setIsEditMode} />
      ) : (
        <EmailVerificationStatus savedEmail={savedEmail} setIsEditMode={setIsEditMode} />
      )}
    </StyledEmailManager>
  );
}

const EditEmailButton = styled.button`
  background: ${colors.white};
  border: 1px solid ${colors.porcelain};
  color: ${colors.offBlack};
  padding: 8px 12px;
  cursor: pointer;
`;

const StyledEmailManager = styled.div`
  height: 72px; // set fixed height so changing modes doesnt shift page content
`;

export default EmailManager;
