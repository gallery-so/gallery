import { GetCollectionResponse } from 'hooks/api/collections/types';
import { getCollectionByIdAction } from 'hooks/api/collections/useCollectionById';
import { GetGalleriesResponse } from 'hooks/api/galleries/types';
import { getGalleriesAction } from 'hooks/api/galleries/useGalleries';
import { getAllNftsAction, GetAllNFtsResponse } from 'hooks/api/nfts/useAllNfts';
import { getMembersListAction } from 'hooks/api/users/useMemberList';
import { Key, Middleware } from 'swr';

const OBSCENELY_LARGE_ASSET_URLS: Record<string, string> = {
  'https://storage.opensea.io/files/33ab86c2a565430af5e7fb8399876960.png':
    'https://lh3.googleusercontent.com/pw/AM-JKLVsudnwN97ULF-DgJC1J_AZ8i-1pMjLCVUqswF1_WShId30uP_p_jSRkmVx-XNgKNIGFSglgRojZQrsLOoCM2pVNJwgx5_E4yeYRsMvDQALFKbJk0_6wj64tjLhSIINwGpdNw0MhtWNehKCipDKNeE',
};

// @ts-expect-error: TODO this is erroring because of `data` type returned by this func
const handleObscenelyLargeAssets: Middleware = (useSWRNext) => (key: Key, fetcher, config) => {
  const swr = useSWRNext(key, fetcher, config);

  // gallery requests are identified through a tuple of [endpoint, action_type]
  if (!Array.isArray(key) || !swr.data) {
    return swr;
  }

  const swrAction = key[1];
  const { data } = swr;

  // help load gallery
  if (swrAction === getGalleriesAction) {
    const galleryData = data as unknown as GetGalleriesResponse;

    const meticulouslyConvertedGalleryData = galleryData.galleries?.map((gallery) => {
      gallery.collections = gallery.collections.map((collection) => {
        collection.nfts = collection.nfts.map((nft) => {
          if (nft.image_url in OBSCENELY_LARGE_ASSET_URLS) {
            nft.image_url = OBSCENELY_LARGE_ASSET_URLS[nft.image_url];
          }

          if (nft.image_preview_url in OBSCENELY_LARGE_ASSET_URLS) {
            nft.image_preview_url = OBSCENELY_LARGE_ASSET_URLS[nft.image_preview_url];
          }

          if (nft.image_thumbnail_url in OBSCENELY_LARGE_ASSET_URLS) {
            nft.image_thumbnail_url = OBSCENELY_LARGE_ASSET_URLS[nft.image_thumbnail_url];
          }

          return nft;
        });

        return collection;
      });

      return gallery;
    });

    return {
      ...swr,
      data: {
        ...galleryData,
        galleries: meticulouslyConvertedGalleryData,
      },
    };
  }

  // help load collection detail
  if (swrAction === getCollectionByIdAction) {
    const collectionData = data as unknown as GetCollectionResponse;

    const meticulouslyConvertedCollectionNfts = collectionData.collection.nfts.map((nft) => {
      if (nft.image_url in OBSCENELY_LARGE_ASSET_URLS) {
        nft.image_url = OBSCENELY_LARGE_ASSET_URLS[nft.image_url];
      }

      if (nft.image_preview_url in OBSCENELY_LARGE_ASSET_URLS) {
        nft.image_preview_url = OBSCENELY_LARGE_ASSET_URLS[nft.image_preview_url];
      }

      if (nft.image_thumbnail_url in OBSCENELY_LARGE_ASSET_URLS) {
        nft.image_thumbnail_url = OBSCENELY_LARGE_ASSET_URLS[nft.image_thumbnail_url];
      }

      return nft;
    });

    return {
      ...swr,
      data: {
        collection: {
          ...collectionData.collection,
          nfts: meticulouslyConvertedCollectionNfts,
        },
      },
    };
  }

  // help load editor sidebar
  if (swrAction === getAllNftsAction) {
    const nftResponseData = data as unknown as GetAllNFtsResponse;

    const meticulouslyConvertedNftData = nftResponseData.nfts.map((nft) => {
      if (nft.image_url in OBSCENELY_LARGE_ASSET_URLS) {
        nft.image_url = OBSCENELY_LARGE_ASSET_URLS[nft.image_url];
      }

      if (nft.image_preview_url in OBSCENELY_LARGE_ASSET_URLS) {
        nft.image_preview_url = OBSCENELY_LARGE_ASSET_URLS[nft.image_preview_url];
      }

      if (nft.image_thumbnail_url in OBSCENELY_LARGE_ASSET_URLS) {
        nft.image_thumbnail_url = OBSCENELY_LARGE_ASSET_URLS[nft.image_thumbnail_url];
      }

      return nft;
    });

    return {
      ...swr,
      data: {
        nfts: meticulouslyConvertedNftData,
      },
    };
  }

  // help load members list
  if (swrAction === getMembersListAction) {
    return swr;
  }

  return swr;
};

export default handleObscenelyLargeAssets;
