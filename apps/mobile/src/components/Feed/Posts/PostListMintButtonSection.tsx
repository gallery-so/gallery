import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { extractRelevantMetadataFromToken } from 'shared/utils/extractRelevantMetadataFromToken';
import { isRadianceContractAddress } from 'src/utils/isRadianceContractAddress';

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
          ...extractRelevantMetadataFromTokenFragment
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

  if (!token) {
    throw new Error('no token exists for thist post')
  }

  const ownerWalletAddress = post?.author?.primaryWallet?.chainAddress?.address ?? '';

  const userAddedMintURL = post?.userAddedMintURL ?? '';

  const { contractAddress } = extractRelevantMetadataFromToken(token);

  const isRadiance = isRadianceContractAddress(contractAddress);

  return (
    <View className="px-3 pb-8 pt-2">
      {(isRadiance || userAddedMintURL) && token && (
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
