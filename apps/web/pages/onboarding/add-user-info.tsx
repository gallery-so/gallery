import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useLazyLoadQuery, useRelayEnvironment } from 'react-relay';
import { fetchQuery, graphql } from 'relay-runtime';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import ErrorText from '~/components/core/Text/ErrorText';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';
import UserInfoForm from '~/components/Profile/UserInfoForm';
import useUserInfoForm from '~/components/Profile/useUserInfoForm';
import { addUserInfoFetchGalleryIdQuery } from '~/generated/addUserInfoFetchGalleryIdQuery.graphql';
import { addUserInfoQuery } from '~/generated/addUserInfoQuery.graphql';
import { Chain } from '~/generated/enums';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import noop from '~/utils/noop';

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

              # ...UserInfoFormFragment
            }
          }
        }
        # ...UserInfoFormQueryFragment
      }
    `,
    {}
  );

  console.log({ query });

  const { push, back, query: urlQuery } = useRouter();
  const relayEnvironment = useRelayEnvironment();

  const handleFormSuccess = useCallback(async () => {
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

    const query = await fetchQuery<addUserInfoFetchGalleryIdQuery>(
      relayEnvironment,
      graphql`
        query addUserInfoFetchGalleryIdQuery {
          viewer {
            ... on Viewer {
              viewerGalleries {
                gallery {
                  dbid
                }
              }
            }
          }
        }
      `,
      {},
      { fetchPolicy: 'network-only' }
    ).toPromise();

    const galleryId = query?.viewer?.viewerGalleries?.[0]?.gallery?.dbid;

    if (galleryId) {
      push({ pathname: '/onboarding/add-email' });
    }
  }, [push, relayEnvironment, urlQuery]);

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
      syncTokens({ type: 'Collected', chain: urlQuery.chain as Chain, silent: true });
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
            // userRef={user}
            // queryRef={query}
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
