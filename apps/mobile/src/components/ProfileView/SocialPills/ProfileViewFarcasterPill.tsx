import { useCallback } from 'react';
import { Linking } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import FarcasterIcon from 'src/icons/FarcasterIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Pill } from '~/components/Pill';
import { Typography } from '~/components/Typography';
import { ProfileViewFarcasterPillFragment$key } from '~/generated/ProfileViewFarcasterPillFragment.graphql';

type Props = {
  userRef: ProfileViewFarcasterPillFragment$key;
};

export default function ProfileViewFarcasterPill({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfileViewFarcasterPillFragment on GalleryUser {
        socialAccounts {
          farcaster {
            username
          }
        }
      }
    `,
    userRef
  );

  const farcasterUsername = user.socialAccounts?.farcaster?.username;

  const handlePress = useCallback(() => {
    if (farcasterUsername) {
      Linking.openURL(`https://warpcast.com/${farcasterUsername}`);
    }
  }, [farcasterUsername]);

  if (!farcasterUsername) {
    return null;
  }

  return (
    <GalleryTouchableOpacity
      onPress={handlePress}
      eventElementId="Social Pill"
      eventName="Social Pill Clicked"
      properties={{ variant: 'Farcaster' }}
    >
      <Pill className="flex flex-row items-center space-x-2 self-start">
        <FarcasterIcon width={14} />
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {user.socialAccounts.farcaster.username}
        </Typography>
      </Pill>
    </GalleryTouchableOpacity>
  );
}
