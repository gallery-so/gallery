import { ResizeMode } from 'expo-av';
import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { EventTokenGridFragment$key } from '~/generated/EventTokenGridFragment.graphql';

import { NftPreview } from '../NftPreview';

type EventTokenGridProps = {
  tokenRefs: EventTokenGridFragment$key;
};

export function EventTokenGrid({ tokenRefs }: EventTokenGridProps) {
  const tokens = useFragment(
    graphql`
      fragment EventTokenGridFragment on Token @relay(plural: true) {
        __typename

        ...NftPreviewFragment
      }
    `,
    tokenRefs
  );

  const inner = useMemo(() => {
    if (tokens.length === 0) {
      return null;
    } else if (tokens.length === 1) {
      const [token] = tokens;

      if (!token) {
        throw new Error('Could not render NFT');
      }

      return <NftPreview resizeMode={ResizeMode.CONTAIN} tokenRef={token} />;
    } else if (tokens.length === 2 || tokens.length === 3) {
      const [firstToken, secondToken] = tokens;

      if (!firstToken || !secondToken) {
        throw new Error('Could not render NFT');
      }

      return (
        <View className="flex w-full flex-row space-x-[2]">
          <View className="h-full w-1/2">
            <NftPreview resizeMode={ResizeMode.COVER} tokenRef={firstToken} />
          </View>
          <View className="h-full w-1/2">
            <NftPreview resizeMode={ResizeMode.COVER} tokenRef={secondToken} />
          </View>
        </View>
      );
    } else if (tokens.length >= 4) {
      const [firstToken, secondToken, thirdToken, fourthToken] = tokens;

      if (!firstToken || !secondToken || !thirdToken || !fourthToken) {
        throw new Error('Could not render NFT');
      }

      return (
        <View className="flex h-full w-full flex-col space-y-[2]">
          <View className="flex h-1/2 w-full flex-row space-x-[2]">
            <View className="h-full w-1/2">
              <NftPreview resizeMode={ResizeMode.COVER} tokenRef={firstToken} />
            </View>
            <View className="h-full w-1/2">
              <NftPreview resizeMode={ResizeMode.COVER} tokenRef={secondToken} />
            </View>
          </View>

          <View className="flex h-1/2 w-full flex-row space-x-[2]">
            <View className="h-full w-1/2">
              <NftPreview resizeMode={ResizeMode.COVER} tokenRef={thirdToken} />
            </View>
            <View className="h-full w-1/2">
              <NftPreview resizeMode={ResizeMode.COVER} tokenRef={fourthToken} />
            </View>
          </View>
        </View>
      );
    }
  }, [tokens]);

  const dimensions = useWindowDimensions();
  const height =
    tokens.length === 2 || tokens.length === 3 ? dimensions.width / 2 : dimensions.width;
  return (
    <View className="p-[2]" style={{ width: dimensions.width, height: height }}>
      {inner}
    </View>
  );
}
