import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityCollectorsFragment$key } from '~/generated/CommunityCollectorsFragment.graphql';
import { CommunityCollectorsQueryFragment$key } from '~/generated/CommunityCollectorsQueryFragment.graphql';

import { useListContentStyle } from '../ProfileView/Tabs/useListContentStyle';
import { CommunityCollectorsList } from './CommunityCollectorsList';

type Props = {
  communityRef: CommunityCollectorsFragment$key;
  queryRef: CommunityCollectorsQueryFragment$key;
};

export function CommunityCollectors({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityCollectorsFragment on Community {
        ...CommunityCollectorsListFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityCollectorsQueryFragment on Query {
        ...CommunityCollectorsListQueryFragment
      }
    `,
    queryRef
  );

  const contentContainerStyle = useListContentStyle();

  return (
    <View style={contentContainerStyle}>
      <CommunityCollectorsList queryRef={query} communityRef={community} />
    </View>
  );
}
