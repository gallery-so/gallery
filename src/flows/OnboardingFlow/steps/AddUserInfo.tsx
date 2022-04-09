import { useCallback, useEffect } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import UserInfoForm from 'components/Profile/UserInfoForm';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import ErrorText from 'components/core/Text/ErrorText';
import Spacer from 'components/core/Spacer/Spacer';

import useUserInfoForm from 'components/Profile/useUserInfoForm';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { AddUserInfoQuery } from '__generated__/AddUserInfoQuery.graphql';

type ConfigProps = {
  onNext: () => Promise<void>;
};

function useWizardConfig({ onNext }: ConfigProps) {
  const { setOnNext } = useWizardCallback();

  useEffect(() => {
    setOnNext(onNext);
  }, [setOnNext, onNext]);
}

function AddUserInfo({ next }: WizardContext) {
  // TODO(Terence): Investigate using a preloaded query here to ensure the user
  // never gets a loading state when navigating to the next step.
  const { viewer } = useLazyLoadQuery<AddUserInfoQuery>(
    graphql`
      query AddUserInfoQuery {
        viewer {
          ... on Viewer {
            user {
              dbid
              bio
              username
            }
          }
        }
      }
    `,
    {}
  );

  if (!viewer?.user) {
    throw new Error('Entered the AddUserInfo step without a logged in user in the cache');
  }

  const {
    username,
    onUsernameChange,
    usernameError,
    onClearUsernameError,
    bio,
    onBioChange,
    generalError,
    onEditUser,
  } = useUserInfoForm({
    onSuccess: next,
    userId: viewer.user.dbid,
    existingUsername: viewer.user.username ?? undefined,
    existingBio: viewer.user.bio ?? undefined,
  });

  const track = useTrack();

  const handleSubmit = useCallback(async () => {
    track('Save Name & Bio', { added_bio: bio.length > 0 });
    return onEditUser();
  }, [bio.length, onEditUser, track]);

  useWizardConfig({ onNext: handleSubmit });

  return (
    <FullPageCenteredStep withFooter>
      <StyledUserInfoForm
        onSubmit={handleSubmit}
        username={username}
        usernameError={usernameError}
        clearUsernameError={onClearUsernameError}
        onUsernameChange={onUsernameChange}
        bio={bio}
        onBioChange={onBioChange}
      />
      <Spacer height={8} />
      <ErrorContainer>
        <ErrorText message={generalError} />
      </ErrorContainer>
    </FullPageCenteredStep>
  );
}

const StyledUserInfoForm = styled(UserInfoForm)`
  width: 600px;
`;

const ErrorContainer = styled.div`
  width: 600px;
`;

export default AddUserInfo;
