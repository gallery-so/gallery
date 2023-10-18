import { useCallback } from 'react';
import { Linking } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { TwitterIcon } from 'src/icons/TwitterIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Pill } from '~/components/Pill';
import { Typography } from '~/components/Typography';
import { ProfileViewTwitterPillFragment$key } from '~/generated/ProfileViewTwitterPillFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

type Props = {
  userRef: ProfileViewTwitterPillFragment$key;
  maxWidth: string;
};

export default function ProfileViewTwitterPill({ userRef, maxWidth }: Props) {
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
      eventContext={contexts['External Social']}
      properties={{ variant: 'Twitter' }}
      className={`ml-2 max-w-[${maxWidth}]`}
    >
      <Pill className="flex flex-row items-center space-x-2 self-start w-full">
        <TwitterIcon width={14} />
        <Typography
          numberOfLines={1}
          className="text-sm"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          {user.socialAccounts.twitter.username}
        </Typography>
      </Pill>
    </GalleryTouchableOpacity>
  );
}
