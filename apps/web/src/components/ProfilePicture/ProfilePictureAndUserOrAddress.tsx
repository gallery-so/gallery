import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

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
  pfpDisabled?: boolean;
};

export function OwnerProfilePictureAndUsername({ userRef, eventContext, pfpDisabled }: Props) {
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
        {pfpDisabled ? null : <RawProfilePicture size="xs" default inheritBorderColor />}
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
        {pfpDisabled ? null : <ProfilePicture size="sm" userRef={user} />}
        <StyledText>{user.username}</StyledText>
      </HStack>
    </UserHoverCard>
  );
}

const StyledText = styled(TitleDiatypeM)`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 1;
  -webkit-line-clamp: 1;
`;

type CreatorProps = {
  userOrAddressRef: ProfilePictureAndUserOrAddressCreatorFragment$key;
  eventContext: AnalyticsEventContextType;
  pfpDisabled?: boolean;
};

export function CreatorProfilePictureAndUsernameOrAddress({
  userOrAddressRef,
  eventContext,
  pfpDisabled = false,
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
      <OwnerProfilePictureAndUsername
        userRef={creatorOrAddress}
        eventContext={eventContext}
        pfpDisabled={pfpDisabled}
      />
    );
  } else if (creatorOrAddress.__typename === 'ChainAddress') {
    return (
      <HStack align="center" gap={4}>
        {pfpDisabled ? null : <RawProfilePicture size="xs" default inheritBorderColor />}
        <EnsOrAddress chainAddressRef={creatorOrAddress} eventContext={eventContext} />
      </HStack>
    );
  }
  return null;
}
