import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { MintLinkButton } from '~/components/MintLinkButton';
import { PostListMintButtonSectionFragment$key } from '~/generated/PostListMintButtonSectionFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

type Props = {
  postRef: PostListMintButtonSectionFragment$key;
};

export function PostListMintButtonSection({ postRef }: Props) {
  const post = useFragment(
    graphql`
      fragment PostListMintButtonSectionFragment on Post {
        tokens {
          ...MintLinkButtonFragment
        }
        author {
          primaryWallet {
            chainAddress {
              address
            }
          }
        }
        userAddedMintURL
      }
    `,
    postRef
  );

  const token = post?.tokens?.[0];

  const ownerWalletAddress = post?.author?.primaryWallet?.chainAddress?.address ?? '';

  const userAddedMintURL = post?.userAddedMintURL ?? '';

  return (
    <View className="px-3 pb-8 pt-2">
      {token && userAddedMintURL && (
        <MintLinkButton
          tokenRef={token}
          variant="secondary"
          eventContext={contexts.Feed}
          referrerAddress={ownerWalletAddress}
          overrideMintUrl={userAddedMintURL}
        />
      )}
    </View>
  );
}
