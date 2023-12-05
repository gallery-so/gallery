import { useCallback, useMemo } from 'react';
import { Linking } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import LensIcon from 'src/icons/LensIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Pill } from '~/components/Pill';
import { Typography } from '~/components/Typography';
import { ProfileViewLensPillFragment$key } from '~/generated/ProfileViewLensPillFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

type Props = {
  userRef: ProfileViewLensPillFragment$key;
  maxWidth: string;
};

export default function ProfileViewLensPill({ userRef, maxWidth }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfileViewLensPillFragment on GalleryUser {
        socialAccounts {
          lens {
            username
          }
        }
      }
    `,
    userRef
  );

  const lensUsername = user.socialAccounts?.lens?.username;

  const rawLensUsername = useMemo(
    () => (lensUsername?.endsWith('.lens') ? lensUsername.slice(0, -5) : lensUsername),
    [lensUsername]
  );

  const handlePress = useCallback(() => {
    if (rawLensUsername) {
      Linking.openURL(`https://lenster.xyz/u/${rawLensUsername}`);
    }
  }, [rawLensUsername]);

  if (!lensUsername || !rawLensUsername) {
    return null;
  }

  return (
    <GalleryTouchableOpacity
      onPress={handlePress}
      eventElementId="Social Pill"
      eventName="Social Pill Clicked"
      eventContext={contexts['External Social']}
      properties={{ variant: 'Lens' }}
      className={`ml-2 max-w-[${maxWidth}]`}
    >
      <Pill className="flex flex-row items-center space-x-1 self-start mr-2">
        <LensIcon width={18} />
        <Typography
          numberOfLines={1}
          className="text-sm"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          {rawLensUsername}
        </Typography>
      </Pill>
    </GalleryTouchableOpacity>
  );
}
