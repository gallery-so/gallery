import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityViewFragment$key } from '~/generated/CommunityViewFragment.graphql';
import GalleryViewEmitter from '~/shared/components/GalleryViewEmitter';

import { BackButton } from '../BackButton';
import { LinkableAddress } from '../LinkableAddress';
import { Typography } from '../Typography';
import { CommunityCollectorsList } from './CommunityCollectorsList';

type Props = {
  queryRef: CommunityViewFragment$key;
};

export function CommunityView({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CommunityViewFragment on Query {
        community: communityByAddress(communityAddress: $communityAddress) {
          ... on ErrCommunityNotFound {
            __typename
          }
          ... on Community {
            __typename
            name
            contractAddress {
              ...LinkableAddressFragment
            }
            ...CommunityCollectorsListFragment
          }
        }
        # ...GalleryViewEmitterWithSuspenseFragment
      }
    `,
    queryRef
  );

  const { community } = query;

  //   TODO: Implement this
  if (!community || community.__typename !== 'Community') {
    return <Text>Community not found</Text>;
  }
  const { contractAddress } = community;

  return (
    <View className="flex-1">
      {/* <GalleryViewEmitter queryRef={query} /> */}

      <View className="flex flex-col px-4 pb-4 z-10 bg-white dark:bg-black">
        <View className="flex flex-row justify-between bg-white dark:bg-black">
          <BackButton />
        </View>
      </View>

      <View className="flex-grow">
        <View className="mb-4 px-4">
          <Typography
            font={{ family: 'GTAlpina', weight: 'StandardLight', italic: true }}
            className="text-2xl mb-4"
          >
            {community.name}
          </Typography>

          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-xs uppercase"
          >
            contract address
          </Typography>
          {contractAddress && <LinkableAddress chainAddressRef={contractAddress} />}
        </View>
        <CommunityCollectorsList communityRef={community} />
      </View>
    </View>
  );
}
