import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityViewFragment$key } from '~/generated/CommunityViewFragment.graphql';

import { BackButton } from '../BackButton';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';
import { CommunityCollectors } from './CommunityCollectors';
import { CommunityHeader } from './CommunityHeader';
import { CommunityMeta } from './CommunityMeta';

type Props = {
  queryRef: CommunityViewFragment$key;
};

type CommunityInnerScreen = 'Posts' | 'Collectors';

export function CommunityView({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CommunityViewFragment on Query {
        community: communityByAddress(communityAddress: $communityAddress)
          @required(action: THROW) {
          ... on ErrCommunityNotFound {
            __typename
          }
          ... on Community {
            __typename
            ...CommunityCollectorsListFragment
            ...CommunityHeaderFragment
            ...CommunityCollectorsFragment
            ...CommunityMetaFragment
          }
        }
        ...CommunityCollectorsQueryFragment
        ...CommunityCollectorsListQueryFragment
      }
    `,
    queryRef
  );

  const { community } = query;

  if (!community || community.__typename !== 'Community') {
    throw new Error(`Unable to fetch the community`);
  }

  const [activeInnerScreen, setActiveInnerScreen] = useState<CommunityInnerScreen>('Collectors');

  const innnerScreen = useMemo(() => {
    if (activeInnerScreen === 'Posts') {
      return <View />;
    } else {
      return <CommunityCollectors queryRef={query} communityRef={community} />;
    }
  }, [activeInnerScreen, community, query]);

  const toggleInnerScreen = useCallback((screen: CommunityInnerScreen) => {
    setActiveInnerScreen(screen);
  }, []);

  return (
    <View className="flex-1">
      <View className="flex flex-col px-4 pb-4 z-10 bg-white dark:bg-black">
        <View className="flex flex-row justify-between bg-white dark:bg-black">
          <BackButton />
        </View>
      </View>

      <View className="flex-grow">
        <View className="px-4">
          <CommunityHeader communityRef={community} />
          <CommunityMeta communityRef={community} />
        </View>

        <View className="items-center border-t border-b border-porcelain">
          <View className="flex flex-row space-x-3 py-3">
            <NavigationItem
              active={activeInnerScreen === 'Posts'}
              title="Posts"
              onPress={() => {
                toggleInnerScreen('Posts');
              }}
            />
            <NavigationItem
              active={activeInnerScreen === 'Collectors'}
              title="Collectors"
              onPress={() => {
                toggleInnerScreen('Collectors');
              }}
            />
          </View>
        </View>

        {innnerScreen}
      </View>
    </View>
  );
}

type NavigationItemProps = {
  active: boolean;
  onPress: () => void;
  title: string;
  style?: ViewProps['style'];
};

function NavigationItem({ active, onPress, style, title }: NavigationItemProps) {
  return (
    <GalleryTouchableOpacity
      className="flex flex-row items-center space-x-1"
      onPress={onPress}
      eventElementId={null}
      eventName={null}
      style={style}
    >
      <Typography
        font={{ family: 'ABCDiatype', weight: 'Medium' }}
        className={clsx('text-metal', active && 'text-black-800')}
      >
        {title}
      </Typography>
      {active && <BlueDot />}
    </GalleryTouchableOpacity>
  );
}

function BlueDot({ style }: { style?: ViewProps['style'] }) {
  return <View className="bg-activeBlue h-1.5 w-1.5 rounded-full" style={style} />;
}
