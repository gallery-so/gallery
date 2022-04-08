/* eslint-disable max-depth */
import { GetCollectionResponse } from 'hooks/api/collections/types';
import { getCollectionByIdAction } from 'hooks/api/collections/useCollectionById';
import { GetGalleriesResponse } from 'hooks/api/galleries/types';
import { getGalleriesAction } from 'hooks/api/galleries/useGalleries';
import { getAllNftsAction, GetAllNFtsResponse } from 'hooks/api/nfts/useAllNfts';
import cloneDeep from 'lodash.clonedeep';
import { Key, Middleware } from 'swr';

const OBSCENELY_LARGE_ASSET_URLS: Record<string, string> = {
  'https://storage.opensea.io/files/33ab86c2a565430af5e7fb8399876960.png':
    'https://lh3.googleusercontent.com/pw/AM-JKLVsudnwN97ULF-DgJC1J_AZ8i-1pMjLCVUqswF1_WShId30uP_p_jSRkmVx-XNgKNIGFSglgRojZQrsLOoCM2pVNJwgx5_E4yeYRsMvDQALFKbJk0_6wj64tjLhSIINwGpdNw0MhtWNehKCipDKNeE',
  'https://openseauserdata.com/files/33ab86c2a565430af5e7fb8399876960.png':
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
    let galleryData = data as unknown as GetGalleriesResponse;

    // first detect offender before doing expensive deep clone
    let foundObscenelyLargeImage = false;

    for (const gallery of galleryData.galleries) {
      for (const collection of gallery.collections) {
        if (collection.nfts) {
          for (const nft of collection.nfts) {
            if (
              nft.image_url in OBSCENELY_LARGE_ASSET_URLS ||
              nft.image_preview_url in OBSCENELY_LARGE_ASSET_URLS ||
              nft.image_thumbnail_url in OBSCENELY_LARGE_ASSET_URLS
            ) {
              foundObscenelyLargeImage = true;
            }
          }
        }
      }
    }

    if (foundObscenelyLargeImage) {
      galleryData = cloneDeep(galleryData);
      galleryData.galleries = galleryData.galleries?.map((gallery) => {
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
    }

    return {
      ...swr,
      data: galleryData,
    };
  }

  // help load collection detail
  if (swrAction === getCollectionByIdAction) {
    // single collections are small and chill to clone
    const collectionData = cloneDeep(data) as unknown as GetCollectionResponse;

    collectionData.collection.nfts = collectionData.collection.nfts.map((nft) => {
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
      data: collectionData,
    };
  }

  // help load editor sidebar
  if (swrAction === getAllNftsAction) {
    let nftResponseData = data as unknown as GetAllNFtsResponse;

    // first detect offender before doing expensive deep clone
    let foundObscenelyLargeImage = false;

    for (const nft of nftResponseData.nfts) {
      if (
        nft.image_url in OBSCENELY_LARGE_ASSET_URLS ||
        nft.image_preview_url in OBSCENELY_LARGE_ASSET_URLS ||
        nft.image_thumbnail_url in OBSCENELY_LARGE_ASSET_URLS
      ) {
        foundObscenelyLargeImage = true;
      }
    }

    if (foundObscenelyLargeImage) {
      nftResponseData = cloneDeep(nftResponseData);
      nftResponseData.nfts = nftResponseData.nfts.map((nft) => {
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
    }

    return {
      ...swr,
      data: nftResponseData,
    };
  }

  return swr;
};

export default handleObscenelyLargeAssets;
