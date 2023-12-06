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
      }
    `,
    postRef
  );

  const token = post?.tokens?.[0];

  const ownerWalletAddress = post?.author?.primaryWallet?.chainAddress?.address ?? '';

  if (!token) return null;
  return (
    <View className="px-3 pb-8 pt-2">
      <MintLinkButton
        tokenRef={token}
        variant="secondary"
        eventElementId="Press Mint Link Button"
        eventName="Press Mint Link Button"
        eventContext={contexts.Feed}
        referrerAddress={ownerWalletAddress}
      />
    </View>
  );
}
