import { captureException } from '@sentry/nextjs';
import { Directions } from 'components/core/enums';
import useBackButton from 'hooks/useBackButton';
import useKeyDown from 'hooks/useKeyDown';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useNavigationArrowsFragment$key } from '__generated__/useNavigationArrowsFragment.graphql';
import NavigationHandle from './NavigationHandle';

type Props = {
  queryRef: useNavigationArrowsFragment$key;
  nftId: string;
  handleSetNftId: (id: string) => void;
};

export default function useNavigationArrows({ queryRef, nftId, handleSetNftId }: Props) {
  const collectionNft = useFragment(
    graphql`
      fragment useNavigationArrowsFragment on CollectionNft {
        nft {
          dbid
        }
        collection @required(action: THROW) {
          dbid
          nfts {
            nft {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const collectionNfts = collectionNft.collection.nfts;

  const { prevNftId, nextNftId } = useMemo(() => {
    if (!collectionNfts) {
      captureException(`NFT collection not found for NFT ${nftId}`);
      return {
        prevNftId: null,
        nextNftId: null,
      };
    }

    const nftIndex = collectionNfts.findIndex(
      (collectionNft) => collectionNft?.nft?.dbid === nftId
    );

    if (nftIndex === -1) {
      captureException(`NFT not found in collection for NFT ${nftId}`);
      return {
        prevNftId: null,
        nextNftId: null,
      };
    }

    return {
      prevNftId: collectionNfts[nftIndex - 1]?.nft?.dbid ?? null,
      nextNftId: collectionNfts[nftIndex + 1]?.nft?.dbid ?? null,
    };
  }, [collectionNfts, nftId]);

  //   const handleBackClick = useBackButton({ username });
  const { replace } = useRouter();

  const { collection } = collectionNft;

  //   const navigateToId = useCallback(
  //     (nftId: string) => {
  //       void replace(`/${username}/${collection.dbid}/${nftId}`);
  //     },
  //     [username, collection.dbid, replace]
  //   );

  //   useKeyDown('Escape', handleBackClick);
  //   useKeyDown('Backspace', handleBackClick);

  const handleNextPress = useCallback(
    () => nextNftId && handleSetNftId(nextNftId),
    [nextNftId, handleSetNftId]
  );

  const handlePrevPress = useCallback(
    () => prevNftId && handleSetNftId(prevNftId),
    [prevNftId, handleSetNftId]
  );

  useKeyDown('ArrowRight', handleNextPress);
  useKeyDown('ArrowLeft', handlePrevPress);

  const rightArrow = useMemo(
    () =>
      nextNftId ? (
        <NavigationHandle direction={Directions.RIGHT} onClick={handleNextPress} />
      ) : null,
    [handleNextPress, nextNftId]
  );

  const leftArrow = useMemo(
    () =>
      prevNftId ? <NavigationHandle direction={Directions.LEFT} onClick={handlePrevPress} /> : null,
    [handlePrevPress, prevNftId]
  );

  return useMemo(() => ({ leftArrow, rightArrow }), [leftArrow, rightArrow]);
}
