import React, { PropsWithChildren, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleM } from '~/components/core/Text/Text';
import { ProfilePictureStack } from '~/components/ProfilePicture/ProfilePictureStack';
import { RawProfilePicture } from '~/components/ProfilePicture/RawProfilePicture';
import icons from '~/icons/index';
import colors from '~/shared/theme/colors';

const avatarUrl =
  'https://s3-alpha-sig.figma.com/img/9a4f/b777/fe4c335512ca4297ad4fd60554e66f18?Expires=1687132800&Signature=I3Q4ovLmvhWUw7EIsyaXhgv6T7hQiKdJHGNL~6c37Y7WLA0pAReuVxFyedUP3RDKemx~IqEg4fNSnqMJl0Y1h7UeQDGIN8Pk9tPn84DW0rHM5DA7himn6yBbbJE0EkEERnmMA4SjQBDoM4axl4-nFVkq~6jNXwjP2ikp7-4ECO-ZOqS0IB8Z-w2ej1bkh2OU6dLZCw4rap2O6zo0egtH6nhHVXMZQnxfHbg2yZzvk3mJflP4vh5g8bFV478Ixxh7gLK-JZV5HvxjKUusvmcWomQpMNE-WasMjp4DapBQijhAyBjl7h03L09Rc0Z2uLRZwt0OoliaIBdzTh8m17NNtw__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4';

const PendingButton = (props: React.ComponentProps<typeof Button>) => {
  const [pending, setPending] = useState(false);

  return (
    <Button
      pending={pending}
      onClick={() => {
        setPending(true);
        setTimeout(() => {
          setPending(false);
        }, 2000);
      }}
      {...props}
    >
      pending
    </Button>
  );
};

export default function DesignPage() {
  const sortedIcons = useMemo(() => {
    const sortedKeys = Object.keys(icons).sort();
    return sortedKeys.reduce((acc: Record<string, () => JSX.Element>, key) => {
      // @ts-expect-error icons[key] will not be undefined
      acc[key] = icons[key];
      return acc;
    }, {});
  }, []);

  const showNftSelector = () => {};

  return (
    <>
      <Section>
        <TitleM>Button</TitleM>
        <Examples>
          <Button eventElementId={null} eventName={null}>
            primary
          </Button>
          <Button eventElementId={null} eventName={null} pending>
            primary
          </Button>
          <Button eventElementId={null} eventName={null} disabled>
            primary
          </Button>
          <Button eventElementId={null} eventName={null} disabled pending>
            primary
          </Button>
        </Examples>
        <Examples>
          <Button eventElementId={null} eventName={null} variant="secondary">
            secondary
          </Button>
          <Button eventElementId={null} eventName={null} variant="secondary" pending>
            secondary
          </Button>
          <Button eventElementId={null} eventName={null} disabled variant="secondary">
            secondary
          </Button>
          <Button eventElementId={null} eventName={null} disabled variant="secondary" pending>
            secondary
          </Button>
        </Examples>
        <Examples>
          <PendingButton eventElementId={null} eventName={null} />
          <PendingButton eventElementId={null} eventName={null} variant="secondary" />
        </Examples>
      </Section>

      <Section>
        <TitleM>Profile Pictures</TitleM>
        <Examples wrap="wrap">
          <ProfilePictureSection>
            <RawProfilePicture letter="F" hasInset size="sm" />
            <RawProfilePicture letter="F" hasInset size="md" />
            <RawProfilePicture letter="F" hasInset size="lg" />
            <RawProfilePicture letter="F" hasInset size="xl" />
          </ProfilePictureSection>

          <ProfilePictureSection>
            <RawProfilePicture letter="F" size="sm" />
            <RawProfilePicture letter="F" size="md" />
            <RawProfilePicture letter="F" size="lg" />
            <RawProfilePicture letter="F" size="xl" />
          </ProfilePictureSection>

          <ProfilePictureSection>
            <RawProfilePicture imageUrl={avatarUrl} size="sm" />
            <RawProfilePicture imageUrl={avatarUrl} size="md" />
            <RawProfilePicture imageUrl={avatarUrl} size="lg" />
            <RawProfilePicture imageUrl={avatarUrl} size="xl" />
          </ProfilePictureSection>

          <ProfilePictureSection>
            <RawProfilePicture hasInset imageUrl={avatarUrl} size="sm" />
            <RawProfilePicture hasInset imageUrl={avatarUrl} size="md" />
            <RawProfilePicture hasInset imageUrl={avatarUrl} size="lg" />
            <RawProfilePicture hasInset imageUrl={avatarUrl} size="xl" />
          </ProfilePictureSection>

          <ProfilePictureSection>
            <RawProfilePicture hasInset default size="sm" />
            <RawProfilePicture hasInset default size="md" />
            <RawProfilePicture hasInset default size="lg" />
            <RawProfilePicture hasInset default size="xl" />
          </ProfilePictureSection>

          <ProfilePictureSection>
            <ProfilePictureStack usersRef={[]} total={0} />
          </ProfilePictureSection>
        </Examples>

        <Examples wrap="wrap">
          <ProfilePictureSection>
            <RawProfilePicture isEditable letter="F" hasInset size="sm" />
            <RawProfilePicture isEditable letter="F" hasInset size="md" />
            <RawProfilePicture isEditable letter="F" hasInset size="lg" />
            <RawProfilePicture isEditable letter="F" hasInset size="xl" />
          </ProfilePictureSection>

          <ProfilePictureSection>
            <RawProfilePicture isEditable letter="F" size="sm" />
            <RawProfilePicture isEditable letter="F" size="md" />
            <RawProfilePicture isEditable letter="F" size="lg" />
            <RawProfilePicture isEditable letter="F" size="xl" />
          </ProfilePictureSection>

          <ProfilePictureSection>
            <RawProfilePicture isEditable imageUrl={avatarUrl} size="sm" />
            <RawProfilePicture isEditable imageUrl={avatarUrl} size="md" />
            <RawProfilePicture isEditable imageUrl={avatarUrl} size="lg" />
            <RawProfilePicture isEditable imageUrl={avatarUrl} size="xl" />
          </ProfilePictureSection>

          <ProfilePictureSection>
            <RawProfilePicture isEditable hasInset imageUrl={avatarUrl} size="sm" />
            <RawProfilePicture isEditable hasInset imageUrl={avatarUrl} size="md" />
            <RawProfilePicture isEditable hasInset imageUrl={avatarUrl} size="lg" />
            <RawProfilePicture isEditable hasInset imageUrl={avatarUrl} size="xl" />
          </ProfilePictureSection>
        </Examples>
      </Section>

      <Section>
        <TitleM>NFT Selector</TitleM>
        <Examples>
          <Button eventElementId={null} eventName={null} onClick={showNftSelector}>
            Open Nft Selector
          </Button>
        </Examples>
      </Section>

      <Section>
        <TitleM>Icons</TitleM>
        <Examples wrap="wrap">
          {Object.keys(sortedIcons).map((iconKey) => {
            const Icon = icons[iconKey];

            if (Icon) {
              return (
                <IconContainer key={iconKey} align="center" justify="center" gap={8}>
                  <Icon />
                  <BaseM color={colors.shadow}>{iconKey}</BaseM>
                </IconContainer>
              );
            }
          })}
        </Examples>
      </Section>
    </>
  );
}

function ProfilePictureSection({ children }: PropsWithChildren) {
  return (
    <HStack
      style={{ backgroundColor: '#e2e2e2', padding: 8, borderRadius: '4px' }}
      align="center"
      gap={4}
    >
      {children}
    </HStack>
  );
}

const Section = styled(VStack)`
  padding: 2rem;
  gap: 16px;
  width: 100vw;
`;

const Examples = styled(HStack)`
  gap: 8px;
  width: 100%;
`;

const IconContainer = styled(HStack)`
  border: 1px solid ${colors.porcelain};
  border-radius: 8px;
  color: ${colors.porcelain};
  padding: 4px 8px;
  height: 48px;
`;
