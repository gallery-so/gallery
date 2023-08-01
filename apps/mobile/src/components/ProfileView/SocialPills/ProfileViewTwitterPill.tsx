import { useCallback } from 'react';
import { Linking } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { TwitterIcon } from 'src/icons/TwitterIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Pill } from '~/components/Pill';
import { Typography } from '~/components/Typography';
import { ProfileViewTwitterPillFragment$key } from '~/generated/ProfileViewTwitterPillFragment.graphql';

type Props = {
  userRef: ProfileViewTwitterPillFragment$key;
};

export default function ProfileViewTwitterPill({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfileViewTwitterPillFragment on GalleryUser {
        socialAccounts {
          twitter {
            username
          }
        }
      }
    `,
    userRef
  );

  const handlePress = useCallback(() => {
    if (user.socialAccounts?.twitter?.username) {
      Linking.openURL(`https://twitter.com/${user.socialAccounts.twitter.username}`);
    }
  }, [user.socialAccounts?.twitter?.username]);

  if (!user.socialAccounts?.twitter?.username) {
    return null;
  }

  return (
    <GalleryTouchableOpacity
      onPress={handlePress}
      eventElementId="Social Pill"
      eventName="Social Pill Clicked"
      properties={{ variant: 'Twitter' }}
    >
      <Pill className="flex flex-row items-center space-x-2 self-start mr-2">
        <TwitterIcon width={14} />
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {user.socialAccounts.twitter.username}
        </Typography>
      </Pill>
    </GalleryTouchableOpacity>
  );
}
