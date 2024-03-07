import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import useUpdateUser, { BIO_MAX_CHAR_COUNT } from 'shared/hooks/useUpdateUser';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM, TitleL } from '~/components/core/Text/Text';
import { TextArea } from '~/components/core/TextArea/TextArea';
import { useNftSelectorForProfilePicture } from '~/components/NftSelector/useNftSelector';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { OnboardingAddBioPageQuery } from '~/generated/OnboardingAddBioPageQuery.graphql';
import unescape from '~/shared/utils/unescape';

import { OnboardingContainer } from './style';

const onboardingStepName = 'add-user-info';

export function OnboardingAddBioPage() {
  const query = useLazyLoadQuery<OnboardingAddBioPageQuery>(
    graphql`
      query OnboardingAddBioPageQuery {
        viewer {
          ... on Viewer {
            user {
              dbid
              bio
              username
              socialAccounts {
                farcaster {
                  bio
                }
              }
              ...ProfilePictureFragment
            }
          }
        }
      }
    `,
    {}
  );

  const showNftSelector = useNftSelectorForProfilePicture();
  const updateUser = useUpdateUser();
  const { push } = useRouter();

  const user = query.viewer?.user;
  const farcasterBio = user?.socialAccounts?.farcaster?.bio;

  const [bio, setBio] = useState(farcasterBio ?? '');
  const [error, setError] = useState('');

  const handleBioChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setError('');
    setBio(event.target.value);
  }, []);

  const unescapedBio = useMemo(() => unescape(bio), [bio]);

  const handleContinue = useCallback(async () => {
    if (bio.length > BIO_MAX_CHAR_COUNT) {
      return;
    }

    try {
      if (user?.dbid && user?.username) {
        await updateUser(user?.dbid, user?.username, bio);

        push({
          pathname: '/onboarding/add-persona',
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }, [bio, updateUser, push, user?.dbid, user?.username]);

  const handleToUsernameStep = useCallback(() => {
    push({
      pathname: '/onboarding/add-username',
    });
  }, [push]);

  return (
    <VStack>
      <FullPageCenteredStep stepName={onboardingStepName}>
        <StyledOnboardingContainer>
          <TitleDiatypeM>Complete your profile</TitleDiatypeM>

          <HStack gap={16} align="center">
            {user && (
              <div onClick={showNftSelector}>
                <ProfilePicture size="xl" isEditable hasInset userRef={user} clickDisabled />
              </div>
            )}
            <StyledUsernameText onClick={handleToUsernameStep} color={colors.shadow}>
              {user?.username}
            </StyledUsernameText>
          </HStack>

          <VStack gap={8}>
            <StyledTextAreaWrapper>
              <TextArea
                onChange={handleBioChange}
                placeholder="Add a bio"
                defaultValue={unescapedBio}
                autoFocus
              />
            </StyledTextAreaWrapper>
            {farcasterBio && (
              <BaseM>We've imported your Farcaster bio. You can edit it or keep it as is.</BaseM>
            )}
            {error && <BaseM color={colors.red}>{error}</BaseM>}
          </VStack>
        </StyledOnboardingContainer>
      </FullPageCenteredStep>
      <OnboardingFooter step={onboardingStepName} onNext={handleContinue} isNextEnabled />
    </VStack>
  );
}

const StyledTextAreaWrapper = styled.div<{ isFocused?: boolean }>`
  height: 144px;
  position: relative;
  background-color: ${colors.faint};
  height: 117px;
  border: 1px solid ${({ isFocused }) => (isFocused ? colors.porcelain : 'transparent')};
`;

const StyledUsernameText = styled(TitleL)`
  cursor: pointer;
`;

const StyledOnboardingContainer = styled(OnboardingContainer)`
  padding: 0 16px;
  width: 100%;
  @media only screen and ${breakpoints.tablet} {
    width: 480px;
  }
`;
