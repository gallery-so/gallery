import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useReportError } from '~/contexts/ErrorReportingContext';
import { useGetPreviewImageUrlsFragment$key } from '~/generated/useGetPreviewImageUrlsFragment.graphql';

type UrlSet = {
  small: string | null;
  medium: string | null;
  large: string | null;
};

type Props = {
  tokenRef: useGetPreviewImageUrlsFragment$key;
  preferStillFrameFromGif?: boolean;
};

const error = new Error('No media or preview URLs returned for token!');

/**
 * All assets, no matter what type, have a set of preview image URLs.
 * This hook returns them.
 */
export default function useGetPreviewImageUrls({
  tokenRef,
  preferStillFrameFromGif = false,
}: Props): UrlSet | Error {
  const token = useFragment(
    graphql`
      fragment useGetPreviewImageUrlsFragment on Token {
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

  const reportError = useReportError();

  if (!media) {
    reportError(error, {
      tags: {
        id: token?.dbid,
      },
    });
    return error;
  }

  let previewUrls: UrlSet | null = null;
  if (
    'previewURLs' in media &&
    media.previewURLs &&
    (media.previewURLs.small || media.previewURLs.medium || media.previewURLs.large)
  ) {
    previewUrls = media.previewURLs;
  } else if ('fallbackMedia' in media && media.fallbackMedia?.mediaURL) {
    previewUrls = {
      small: media.fallbackMedia.mediaURL,
      medium: media.fallbackMedia.mediaURL,
      large: media.fallbackMedia.mediaURL,
    };
  }

  if (!previewUrls) {
    reportError(error, {
      tags: {
        id: token?.dbid,
        assetType: media?.__typename,
      },
    });
    return error;
  }

  if (preferStillFrameFromGif && media.__typename === 'GIFMedia') {
    if (media.staticPreviewURLs) {
      return {
        small: media.staticPreviewURLs.small,
        medium: media.staticPreviewURLs.medium,
        large: media.staticPreviewURLs.large,
      };
    }
  }

  return previewUrls;
}
