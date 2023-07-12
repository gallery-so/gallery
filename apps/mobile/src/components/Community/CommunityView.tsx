import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityViewFragment$key } from '~/generated/CommunityViewFragment.graphql';

import { BackButton } from '../BackButton';
import { LinkableAddress } from '../LinkableAddress';
import { Markdown } from '../Markdown';
import { Typography } from '../Typography';
import { CommunityCollectorsList } from './CommunityCollectorsList';

type Props = {
  queryRef: CommunityViewFragment$key;
};

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
            name
            description
            contractAddress {
              ...LinkableAddressFragment
            }
            ...CommunityCollectorsListFragment
          }
        }

        ...CommunityCollectorsListQueryFragment
      }
    `,
    queryRef
  );

  const { community } = query;

  if (!community || community.__typename !== 'Community') {
    throw new Error(`Unable to fetch the community`);
  }
  const { contractAddress } = community;

  return (
    <View className="flex-1">
      <View className="flex flex-col px-4 pb-4 z-10 bg-white dark:bg-black">
        <View className="flex flex-row justify-between bg-white dark:bg-black">
          <BackButton />
        </View>
      </View>

      <View className="flex-grow">
        <View className="mb-4 px-4">
          <View className="mb-4">
            <Typography
              font={{ family: 'GTAlpina', weight: 'StandardLight', italic: true }}
              className="text-2xl"
            >
              {community.name}
            </Typography>
            {community.description && (
              <Typography
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
                className="text-sm mt-1"
              >
                <Markdown>{community.description}</Markdown>
              </Typography>
            )}
          </View>
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-xs uppercase"
          >
            contract address
          </Typography>
          {contractAddress && (
            <LinkableAddress chainAddressRef={contractAddress} type="Community Contract Address" />
          )}
        </View>

        <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-sm mb-4 px-4">
          Collectors on Gallery
        </Typography>

        <CommunityCollectorsList queryRef={query} communityRef={community} />
      </View>
    </View>
  );
}
