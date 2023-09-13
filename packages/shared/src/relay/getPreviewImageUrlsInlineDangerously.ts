import { graphql, readInlineData } from 'relay-runtime';

import { getPreviewImageUrlsInlineDangerouslyFragment$key } from '~/generated/getPreviewImageUrlsInlineDangerouslyFragment.graphql';

import { CouldNotRenderNftError } from '../errors/CouldNotRenderNftError';

type UrlSet = {
  small: string | null;
  medium: string | null;
  large: string | null;
};

export const SyncingMediaWithoutFallback = Symbol('SyncingMediaWithoutFallback');

export type GetPreviewImageUrlsResult =
  | {
      type: 'valid';
      urls: UrlSet;
    }
  | {
      type: typeof SyncingMediaWithoutFallback;
    }
  | {
      type: 'error';
      error: CouldNotRenderNftError;
    };

type Props = {
  tokenRef: getPreviewImageUrlsInlineDangerouslyFragment$key;
  preferStillFrameFromGif?: boolean;
};

/**
 * NOTE: this function should rarely be used directly as it won't report errors,
 * and it won't automatically poll on behalf of SyncingMedia.
 *
 * Use `useGetPreviewImageUrlsWithPolling` instead.
 */
export function getPreviewImageUrlsInlineDangerously({
  tokenRef,
  preferStillFrameFromGif = false,
}: Props): GetPreviewImageUrlsResult {
  const token = readInlineData(
    graphql`
      fragment getPreviewImageUrlsInlineDangerouslyFragment on Token @inline {
        dbid
        media {
          ... on VideoMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }

            fallbackMedia {
              mediaURL
            }
          }

          ... on AudioMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on GltfMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on HtmlMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on ImageMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on GIFMedia {
            __typename
            staticPreviewURLs {
              small
              medium
              large
            }
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on JsonMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on TextMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on PdfMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on UnknownMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on InvalidMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on SyncingMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }
        }
      }
    `,
    tokenRef
  );

  const media = token?.media;

  if (!media) {
    return {
      type: 'error',
      error: new CouldNotRenderNftError(
        'getPreviewImageUrlsInlineDangerously',
        'No media object returned for token!',
        {
          id: token?.dbid,
        }
      ),
    };
  }

  let previewUrls: UrlSet | null = null;
  if (
    'previewURLs' in media &&
    media.previewURLs &&
    (media.previewURLs.small || media.previewURLs.medium || media.previewURLs.large)
  ) {
    previewUrls = media.previewURLs;
  } else if ('fallbackMedia' in media) {
    if (media.fallbackMedia?.mediaURL) {
      previewUrls = {
        small: media.fallbackMedia.mediaURL,
        medium: media.fallbackMedia.mediaURL,
        large: media.fallbackMedia.mediaURL,
      };
    } else if (media.__typename === 'SyncingMedia' && !media.fallbackMedia?.mediaURL) {
      return { type: SyncingMediaWithoutFallback };
    }
  }

  if (!previewUrls) {
    return {
      type: 'error',
      error: new CouldNotRenderNftError(
        'getPreviewImageUrlsInlineDangerously',
        'No preview URLs returned for token!',
        {
          id: token?.dbid,
          assetType: media?.__typename,
        }
      ),
    };
  }

  if (preferStillFrameFromGif && media.__typename === 'GIFMedia') {
    if (media.staticPreviewURLs) {
      return {
        type: 'valid',
        urls: {
          small: media.staticPreviewURLs.small,
          medium: media.staticPreviewURLs.medium,
          large: media.staticPreviewURLs.large,
        },
      };
    }
  }

  return {
    type: 'valid',
    urls: previewUrls,
  };
}
