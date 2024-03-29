import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { ProfilePictureAndUserOrAddressCreatorFragment$key } from '~/generated/ProfilePictureAndUserOrAddressCreatorFragment.graphql';
import { ProfilePictureAndUserOrAddressOwnerFragment$key } from '~/generated/ProfilePictureAndUserOrAddressOwnerFragment.graphql';
import { AnalyticsEventContextType } from '~/shared/analytics/constants';

import { EnsOrAddress } from '../EnsOrAddress';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';
import { ProfilePicture } from './ProfilePicture';
import { RawProfilePicture } from './RawProfilePicture';

type Props = {
  userRef: ProfilePictureAndUserOrAddressOwnerFragment$key;
  handlePress: () => void;
  eventContext: AnalyticsEventContextType;
  pfpDisabled?: boolean;
};

export function OwnerProfilePictureAndUsername({
  userRef,
  handlePress,
  eventContext,
  pfpDisabled,
}: Props) {
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
      }
    `,
    userRef
  );

  // NOTE: we don't really have universal users popping up in the app yet,
  //       so this is more for future-proofing
  if (user.universal && user.primaryWallet?.chainAddress) {
    return (
      <GalleryTouchableOpacity
        className="flex flex-row items-center space-x-1"
        onPress={handlePress}
        eventElementId="Token Owner Username"
        eventName="Token Owner Username"
        eventContext={eventContext}
      >
        {pfpDisabled ? null : (
          <RawProfilePicture
            size="xs"
            default
            eventElementId="PFP"
            eventName="PFP Press"
            eventContext={eventContext}
          />
        )}
        {/* need to wrap in a View for the parent's space-x-1 padding to work */}
        <View>
          <EnsOrAddress
            chainAddressRef={user.primaryWallet.chainAddress}
            eventContext={eventContext}
          />
        </View>
      </GalleryTouchableOpacity>
    );
  }

  return (
    <GalleryTouchableOpacity
      className="flex flex-row items-center space-x-1"
      onPress={handlePress}
      eventElementId="Token Owner Username"
      eventName="Token Owner Username"
      eventContext={eventContext}
    >
      {pfpDisabled ? null : <ProfilePicture userRef={user} size="xs" />}
      <Typography
        numberOfLines={1}
        className="text-sm"
        font={{ family: 'ABCDiatype', weight: 'Bold' }}
      >
        {user.username}
      </Typography>
    </GalleryTouchableOpacity>
  );
}

type CreatorProps = {
  userOrAddressRef: ProfilePictureAndUserOrAddressCreatorFragment$key;
  handlePress: () => void;
  eventContext: AnalyticsEventContextType;
  pfpDisabled?: boolean;
};

export function CreatorProfilePictureAndUsernameOrAddress({
  userOrAddressRef,
  handlePress,
  eventContext,
  pfpDisabled,
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
        handlePress={handlePress}
        eventContext={eventContext}
        pfpDisabled={pfpDisabled}
      />
    );
  } else if (creatorOrAddress.__typename === 'ChainAddress') {
    return (
      <View className="flex flex-row items-center space-x-1">
        {pfpDisabled ? null : (
          <RawProfilePicture
            size="xs"
            default
            eventElementId="NftDetail Creator PFP"
            eventName="NftDetail Creator PFP"
            eventContext={eventContext}
          />
        )}
        <View>
          <EnsOrAddress chainAddressRef={creatorOrAddress} eventContext={eventContext} />
        </View>
      </View>
    );
  }
  return null;
}
