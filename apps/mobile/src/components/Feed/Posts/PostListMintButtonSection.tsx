import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { MintLinkButton } from '~/components/MintLinkButton';
import { PostListMintButtonSectionFragment$key } from '~/generated/PostListMintButtonSectionFragment.graphql';

type Props = {
  postRef: PostListMintButtonSectionFragment$key;
};

export function PostListMintButtonSection({ postRef }: Props) {
  const post = useFragment(
    graphql`
      fragment PostListMintButtonSectionFragment on Post {
        dbid
        tokens {
          ...MintLinkButtonFragment
        }
      }
    `,
    postRef
  );

  const token = post?.tokens?.[0];

  if (!token) return null;

  return (
    <View className="px-3 pb-8 pt-2">
      <MintLinkButton tokenRef={token} variant="secondary" />
    </View>
  );
}
