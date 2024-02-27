import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import useUpdateUser, { BIO_MAX_CHAR_COUNT } from 'shared/hooks/useUpdateUser';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM, TitleL } from '~/components/core/Text/Text';
import { TextArea } from '~/components/core/TextArea/TextArea';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { OnboardingAddBioPageQuery } from '~/generated/OnboardingAddBioPageQuery.graphql';
import unescape from '~/shared/utils/unescape';

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

  return (
    <VStack>
      <FullPageCenteredStep from={40} to={80}>
        <Container gap={16}>
          <TitleDiatypeM>Complete your profile</TitleDiatypeM>

          <HStack gap={16} align="center">
            {user && <ProfilePicture size="xl" isEditable userRef={user} />}
            <TitleL color={colors.shadow}>{user?.username}</TitleL>
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
        </Container>
      </FullPageCenteredStep>
      <OnboardingFooter step={'add-username'} onNext={handleContinue} isNextEnabled />
    </VStack>
  );
}

const Container = styled(VStack)`
  width: 480px;
`;

const StyledTextAreaWrapper = styled.div<{ isFocused?: boolean }>`
  height: 144px;
  position: relative;
  background-color: ${colors.faint};
  height: 117px;
  border: 1px solid ${({ isFocused }) => (isFocused ? colors.porcelain : 'transparent')};
`;
