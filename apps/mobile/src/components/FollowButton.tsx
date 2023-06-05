import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { TouchableOpacityProps, View, ViewProps } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';
import { graphql, useFragment } from 'react-relay';

import { Typography } from '~/components/Typography';
import { FollowButtonQueryFragment$key } from '~/generated/FollowButtonQueryFragment.graphql';
import { FollowButtonUserFragment$key } from '~/generated/FollowButtonUserFragment.graphql';
import useFollowUser from '~/shared/relay/useFollowUser';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import useUnfollowUser from '~/shared/relay/useUnfollowUser';

import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';

type Props = {
  style?: ViewProps['style'];
  queryRef: FollowButtonQueryFragment$key;
  userRef: FollowButtonUserFragment$key;
  className?: string;
  source?: string; // where the FollowButton is being used, for analytics
  width?: 'fixed' | 'grow';
};

export function FollowButton({ queryRef, userRef, style, width = 'fixed' }: Props) {
  const loggedInUserQuery = useFragment(
    graphql`
      fragment FollowButtonQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
              following @required(action: THROW) {
                id @required(action: THROW)
              }
            }
          }
        }

        ...useLoggedInUserIdFragment
        ...useFollowUserFragment
        ...useUnfollowUserFragment
      }
    `,
    queryRef
  );

  const userToFollow = useFragment(
    graphql`
      fragment FollowButtonUserFragment on GalleryUser {
        id
        dbid
      }
    `,
    userRef
  );

  const loggedInUserId = useLoggedInUserId(loggedInUserQuery);
  const followingList = loggedInUserQuery.viewer?.user?.following;

  const isFollowing = useMemo(() => {
    if (!followingList) {
      return false;
    }
    const followingIds = new Set(
      followingList.map((following: { id: string } | null) => following?.id)
    );
    return followingIds.has(userToFollow.id);
  }, [followingList, userToFollow.id]);

  const followUser = useFollowUser({ queryRef: loggedInUserQuery });
  const unfollowUser = useUnfollowUser({ queryRef: loggedInUserQuery });

  const handleFollowPress = useCallback(async () => {
    trigger('impactLight');

    await followUser(userToFollow.dbid);
  }, [userToFollow.dbid, followUser]);

  const handleUnfollowPress = useCallback(async () => {
    trigger('impactLight');

    await unfollowUser(userToFollow.dbid);
  }, [userToFollow.dbid, unfollowUser]);

  const isSelf = loggedInUserId === userToFollow?.id;

  const followChip = useMemo(() => {
    if (isSelf) {
      return null;
    } else if (isFollowing) {
      return (
        <FollowChip variant="unfollow" onPress={handleUnfollowPress} width={width}>
          Following
        </FollowChip>
      );
    } else {
      return (
        <FollowChip variant="follow" onPress={handleFollowPress} width={width}>
          Follow
        </FollowChip>
      );
    }
  }, [isSelf, isFollowing, handleUnfollowPress, width, handleFollowPress]);

  return <View style={style}>{followChip}</View>;
}

type FollowChipVariant = 'follow' | 'unfollow';

type FollowChipProps = PropsWithChildren<{
  variant: FollowChipVariant;
  onPress: TouchableOpacityProps['onPress'];
  width?: 'fixed' | 'grow';
}>;

type ChipContainerVariants = {
  [variant in FollowChipVariant]: {
    [colorSchem in 'light' | 'dark']: {
      [activeState in 'active' | 'inactive']: {
        containerClassName: string;
        textClassName: string;
      };
    };
  };
};

// This is a typesafe object to represent the variants of the FollowButton.
// You can find an up to date source of truth at the following link.
// https://www.figma.com/file/9SV2MUDU1DVieJclgr3Z43/Dark-Mode-%5BDesktop-%2B-Mobile%5D?type=design&node-id=430-8037&t=ZwDhf5OcEhuhgQKy-0
const chipContainerVariants: ChipContainerVariants = {
  follow: {
    light: {
      inactive: {
        containerClassName: 'bg-black-800',
        textClassName: 'text-white',
      },
      active: {
        containerClassName: 'bg-black-600',
        textClassName: 'text-white',
      },
    },
    dark: {
      inactive: {
        containerClassName: 'bg-white',
        textClassName: 'text-black-800',
      },
      active: {
        containerClassName: 'bg-metal',
        textClassName: 'text-black-800',
      },
    },
  },
  unfollow: {
    light: {
      inactive: {
        containerClassName: 'bg-porcelain',
        textClassName: 'text-black-800',
      },
      active: {
        containerClassName: 'bg-metal',
        textClassName: 'text-black-800',
      },
    },
    dark: {
      inactive: {
        containerClassName: 'bg-[#303030]',
        textClassName: 'text-white',
      },
      active: {
        containerClassName: 'bg-black-600',
        textClassName: 'text-white',
      },
    },
  },
};

function FollowChip({ children, variant, onPress, width }: FollowChipProps) {
  const { colorScheme } = useColorScheme();
  const [active, setActive] = useState(false);

  const chipContainerClassNames =
    chipContainerVariants[variant][colorScheme][active ? 'active' : 'inactive'];

  return (
    <GalleryTouchableOpacity
      onPressIn={() => setActive(true)}
      onPressOut={() => setActive(false)}
      eventElementId="Follow Button"
      eventName="Follow Button Clicked"
      activeOpacity={1}
      properties={{ variant }}
      onPress={onPress}
      className={clsx(
        'flex h-6 items-center justify-center rounded-sm px-2 bg-black',
        chipContainerClassNames.containerClassName,
        {
          'w-24': width === 'fixed',
          'w-auto': width === 'grow',
        }
      )}
    >
      <Typography
        className={clsx('text-sm', chipContainerClassNames.textClassName)}
        font={{ family: 'ABCDiatype', weight: 'Bold' }}
      >
        {children}
      </Typography>
    </GalleryTouchableOpacity>
  );
}
