import { TouchableOpacity, View } from 'react-native';
import { Typography } from '../Typography';
import { graphql, useFragment } from 'react-relay';
import { SuggestionUserFragment$key } from '~/generated/SuggestionUserFragment.graphql';
import { Markdown } from '../Markdown';
import { FollowButton } from './FollowButton';
import { SuggestionUserQueryFragment$key } from '~/generated/SuggestionUserQueryFragment.graphql';

type Props = {
  userRef: SuggestionUserFragment$key;
  queryRef: SuggestionUserQueryFragment$key;
};

export function SuggestionUser({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment SuggestionUserFragment on GalleryUser {
        username
        bio
        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment SuggestionUserQueryFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  return (
    <View className="flex flex-row items-center justify-between py-3 px-4">
      <View className="flex-1 pr-4">
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
        >
          {user.username}
        </Typography>
        <Markdown numberOfLines={1}>{user.bio}</Markdown>
      </View>

      <FollowButton userRef={user} queryRef={query} />
    </View>
  );
}
