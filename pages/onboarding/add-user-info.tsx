import { useCallback } from 'react';
import styled from 'styled-components';
import UserInfoForm from 'components/Profile/UserInfoForm';
import ErrorText from 'components/core/Text/ErrorText';

import useUserInfoForm from 'components/Profile/useUserInfoForm';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { VStack } from 'components/core/Spacer/Stack';
import { useRouter } from 'next/router';
import { OnboardingFooter } from 'components/Onboarding/OnboardingFooter';
import useSyncTokens from 'hooks/api/tokens/useSyncTokens';
import FullPageCenteredStep from 'components/Onboarding/FullPageCenteredStep';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { addUserInfoQuery } from '../../__generated__/addUserInfoQuery.graphql';
import noop from 'utils/noop';
import { Chain } from 'components/ManageGallery/OrganizeCollection/Sidebar/chains';

function AddUserInfo() {
  const query = useLazyLoadQuery<addUserInfoQuery>(
    graphql`
      query addUserInfoQuery {
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

  const { push, back, query: urlQuery } = useRouter();

  const handleFormSuccess = useCallback(() => {
    // After we've created an account, we can remove these
    // params from the URL since we won't need them
    // and it looks better if the URL is clean
    const nextParams = { ...urlQuery };
    delete nextParams.signature;
    delete nextParams.nonce;
    delete nextParams.chain;
    delete nextParams.address;
    delete nextParams.authMechanism;
    delete nextParams.userFriendlyWalletName;

    push({ pathname: '/onboarding/create' });
  }, [push, urlQuery]);

  const {
    bio,
    username,
    onEditUser,
    onBioChange,
    generalError,
    usernameError,
    isUsernameValid,
    onUsernameChange,
  } = useUserInfoForm({
    onSuccess: noop,
    userId: query.viewer?.user?.dbid,
    existingBio: query.viewer?.user?.bio ?? '',
    existingUsername: query.viewer?.user?.username ?? '',
  });

  const track = useTrack();
  const { isLocked, syncTokens } = useSyncTokens();

  const handleSubmit = useCallback(async () => {
    const { success } = await onEditUser();

    if (!success) {
      return;
    }

    track('Save Name & Bio', { added_bio: bio.length > 0 });

    if (!isLocked) {
      // Start the sync tokens mutation so the user
      // sees their NFTs loaded ASAP.
      syncTokens(urlQuery.chain as Chain);
    }

    handleFormSuccess();
  }, [bio.length, handleFormSuccess, isLocked, onEditUser, syncTokens, track, urlQuery.chain]);

  return (
    <VStack>
      <FullPageCenteredStep withFooter>
        <VStack gap={8}>
          <StyledUserInfoForm
            bio={bio}
            mode="Add"
            onSubmit={handleSubmit}
            username={username}
            usernameError={usernameError}
            onUsernameChange={onUsernameChange}
            onBioChange={onBioChange}
          />
          <ErrorContainer>
            <ErrorText message={generalError} />
          </ErrorContainer>
        </VStack>
      </FullPageCenteredStep>

      <OnboardingFooter
        step={'add-user-info'}
        onNext={handleSubmit}
        isNextEnabled={isUsernameValid}
        onPrevious={back}
      />
    </VStack>
  );
}

const StyledUserInfoForm = styled(UserInfoForm)`
  width: 600px;
`;

const ErrorContainer = styled.div`
  width: 600px;
`;

export default AddUserInfo;
