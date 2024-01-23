import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityCollectorsGridRowFragment$key } from '~/generated/CommunityCollectorsGridRowFragment.graphql';

import { CommunityCollectorsGridItem } from './CommunityCollectorsGridItem';

type Props = {
  tokenRefs: CommunityCollectorsGridRowFragment$key;
};

export function CommunityCollectorsGridRow({ tokenRefs }: Props) {
  const tokens = useFragment(
    graphql`
      fragment CommunityCollectorsGridRowFragment on Token @relay(plural: true) {
        __typename
        ...CommunityCollectorsGridItemFragment
      }
    `,
    tokenRefs
  );

  return (
    <View className="flex-row px-4 space-x-2 mb-[20]">
      {tokens.map((token) => (
        <CommunityCollectorsGridItem tokenRef={token} />
      ))}
    </View>
  );
}
