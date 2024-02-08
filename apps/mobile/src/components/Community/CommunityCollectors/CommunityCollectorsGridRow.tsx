import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityCollectorsGridRowFragment$key } from '~/generated/CommunityCollectorsGridRowFragment.graphql';
import { CommunityCollectorsGridRowQueryFragment$key } from '~/generated/CommunityCollectorsGridRowQueryFragment.graphql';

import { CommunityCollectorsGridItem } from './CommunityCollectorsGridItem';

type Props = {
  queryRef: CommunityCollectorsGridRowQueryFragment$key;
  tokenRefs: CommunityCollectorsGridRowFragment$key;
};

export function CommunityCollectorsGridRow({ queryRef, tokenRefs }: Props) {
  const query = useFragment(
    graphql`
      fragment CommunityCollectorsGridRowQueryFragment on Query {
        ...CommunityCollectorsGridItemQueryFragment
      }
    `,
    queryRef
  );
  const tokens = useFragment(
    graphql`
      fragment CommunityCollectorsGridRowFragment on Token @relay(plural: true) {
        __typename
        dbid
        ...CommunityCollectorsGridItemFragment
      }
    `,
    tokenRefs
  );

  return (
    <View className="flex-row px-4 space-x-2 mb-[20]">
      {tokens.map((token) => (
        <CommunityCollectorsGridItem key={token.dbid} queryRef={query} tokenRef={token} />
      ))}
    </View>
  );
}
