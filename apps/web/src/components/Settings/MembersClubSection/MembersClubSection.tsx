import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';
import { GALLERY_DISCORD } from '~/constants/urls';
import { MembersClubSectionFragment$key } from '~/generated/MembersClubSectionFragment.graphql';
import CircleCheckIcon from '~/icons/CircleCheckIcon';
import colors from '~/shared/theme/colors';
import { GALLERY_OS_ADDRESS } from '~/shared/utils/getOpenseaExternalUrl';

import SettingsRowDescription from '../SettingsRowDescription';

type Props = {
  queryRef: MembersClubSectionFragment$key;
};

export default function MembersClubSection({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment MembersClubSectionFragment on Query {
        viewer {
          ... on Viewer {
            user {
              roles
            }
          }
        }
      }
    `,
    queryRef
  );

  const hasEarlyAccess = useMemo(() => {
    return query.viewer?.user?.roles?.includes('EARLY_ACCESS');
  }, [query]);

  return (
    <VStack>
      <TitleDiatypeL>Members Club</TitleDiatypeL>
      <HStack justify="space-between" align="center" gap={8}>
        <SettingsRowDescription>
          Unlock early access to features, a profile badge, and the members-only{' '}
          <GalleryLink href={GALLERY_DISCORD}>Discord channel</GalleryLink> by holding a{' '}
          <GalleryLink
            href={`https://opensea.io/collection/gallery-membership-cards?ref=${GALLERY_OS_ADDRESS}`}
          >
            Premium Gallery Membership Card
          </GalleryLink>{' '}
          and verifying your email address.
        </SettingsRowDescription>
        <HStack align="center" gap={4} shrink={false}>
          {hasEarlyAccess ? (
            <>
              <CircleCheckIcon />
              <BaseM>Active</BaseM>
            </>
          ) : (
            <BaseM color={colors.metal}>Inactive</BaseM>
          )}
        </HStack>
      </HStack>
    </VStack>
  );
}
