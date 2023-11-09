import { graphql, useFragment } from 'react-relay';

import { ProfilePictureAndUserOrAddressCreatorFragment$key } from '~/generated/ProfilePictureAndUserOrAddressCreatorFragment.graphql';
import { ProfilePictureAndUserOrAddressOwnerFragment$key } from '~/generated/ProfilePictureAndUserOrAddressOwnerFragment.graphql';
import { AnalyticsEventContextType } from '~/shared/analytics/constants';

import { HStack } from '../core/Spacer/Stack';
import { TitleDiatypeM } from '../core/Text/Text';
import { EnsOrAddress } from '../EnsOrAddress';
import UserHoverCard from '../HoverCard/UserHoverCard';
import { ProfilePicture } from './ProfilePicture';
import { RawProfilePicture } from './RawProfilePicture';

type Props = {
  userRef: ProfilePictureAndUserOrAddressOwnerFragment$key;
  eventContext: AnalyticsEventContextType;
};

export function OwnerProfilePictureAndUsername({ userRef, eventContext }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfilePictureAndUserOrAddressOwnerFragment on GalleryUser {
        username
        universal
        primaryWallet {
          chainAddress {
            ...EnsOrAddressWithSuspenseFragment
          }
        }
        ...ProfilePictureFragment
        ...UserHoverCardFragment
      }
    `,
    userRef
  );

  // NOTE: we don't really have universal users popping up in the app yet,
  //       so this is more for future-proofing
  if (user.universal && user.primaryWallet?.chainAddress) {
    return (
      <HStack align="center" gap={4}>
        <RawProfilePicture size="xs" default inheritBorderColor />
        <EnsOrAddress
          chainAddressRef={user.primaryWallet.chainAddress}
          eventContext={eventContext}
        />
      </HStack>
    );
  }

  return (
    <UserHoverCard userRef={user}>
      <HStack align="center" gap={4}>
        <ProfilePicture size="sm" userRef={user} />
        <TitleDiatypeM>{user.username}</TitleDiatypeM>
      </HStack>
    </UserHoverCard>
  );
}

type CreatorProps = {
  userOrAddressRef: ProfilePictureAndUserOrAddressCreatorFragment$key;
  eventContext: AnalyticsEventContextType;
};

export function CreatorProfilePictureAndUsernameOrAddress({
  userOrAddressRef,
  eventContext,
}: CreatorProps) {
  const creatorOrAddress = useFragment(
    graphql`
      fragment ProfilePictureAndUserOrAddressCreatorFragment on GalleryUserOrAddress {
        __typename
        ... on GalleryUser {
          ...ProfilePictureAndUserOrAddressOwnerFragment
        }
        ... on ChainAddress {
          ...EnsOrAddressWithSuspenseFragment
        }
      }
    `,
    userOrAddressRef
  );

  if (creatorOrAddress.__typename === 'GalleryUser') {
    return (
      <OwnerProfilePictureAndUsername userRef={creatorOrAddress} eventContext={eventContext} />
    );
  } else if (creatorOrAddress.__typename === 'ChainAddress') {
    return (
      <HStack align="center" gap={4}>
        <RawProfilePicture size="xs" default inheritBorderColor />
        <EnsOrAddress chainAddressRef={creatorOrAddress} eventContext={eventContext} />
      </HStack>
    );
  }
  return null;
}
