import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { extractRelevantMetadataFromToken } from 'shared/utils/extractRelevantMetadataFromToken';

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

  const ownerWalletAddress = post?.author?.primaryWallet?.chainAddress?.address ?? '';

  const userAddedMintURL = post?.userAddedMintURL ?? '';

  const { contractAddress } = useMemo(() => {
    if (token) {
      return extractRelevantMetadataFromToken(token);
    }
    return {
      contractAddress: '',
      chain: '',
      mintUrl: '',
    };
  }, [token]);

  const isRadiance = useMemo(() => {
    return contractAddress === '0x78b92e9afd56b033ead2103f07aced5fac8c0854';
  }, [contractAddress]);

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
