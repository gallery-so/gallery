import { readInlineData, graphql } from 'relay-runtime';
import { FALLBACK_URL } from 'utils/nft';
import { getVideoOrImageUrlForNftPreviewFragment$key } from '__generated__/getVideoOrImageUrlForNftPreviewFragment.graphql';

type UrlSet = { small: string | null; medium: string | null; large: string | null };

export default function getVideoOrImageUrlForNftPreview(
  nftRef: getVideoOrImageUrlForNftPreviewFragment$key
): { type: 'video'; urls: UrlSet } | { type: 'image'; urls: UrlSet } | undefined {
  const { media } = readInlineData(
    graphql`
      fragment getVideoOrImageUrlForNftPreviewFragment on Nft @inline {
        media {
          ... on VideoMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on AudioMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on GltfMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on HtmlMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on ImageMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on InvalidMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on JsonMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on TextMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on UnknownMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }
        }
      }
    `,
    nftRef
  );

  if (!media || !('previewURLs' in media) || media.previewURLs === null) {
    return undefined;
  }

  if (!media.previewURLs.large && !media.previewURLs.medium && !media.previewURLs.small) {
    return {
      type: 'image',
      urls: { large: FALLBACK_URL, medium: FALLBACK_URL, small: FALLBACK_URL },
    };
  }

  if (media.__typename === 'VideoMedia') {
    // TODO: we shouldn't need to do this check on the client, but this is a necessary evil
    // until we're on the indexer. in summary, we don't know whether something was categorized
    // as VideoMedia due to its OpenseaImageURL or OpenseaAnimationURL, so we need to do one
    // more check ourselves
    if (media.previewURLs.large?.endsWith('mp4')) {
      return { type: 'video', urls: media.previewURLs };
    }
    return { type: 'image', urls: media.previewURLs };
  }
  return { type: 'image', urls: media.previewURLs };
}
