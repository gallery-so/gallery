// eslint-disable-next-line no-restricted-imports
import { fetchSanityContent as _fetchSanityContent } from '~/shared/utils/sanity';
import unescape from '~/shared/utils/unescape';

export const fetchSanityContent = _fetchSanityContent(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

export function getFeaturePageQueryString(pageId: string) {
  return `
    *[ _type == "featurePage" && id == "${pageId}" ]{
      ...,
      "featureHighlights": featureHighlights[]->{
        heading,
        orientation,
        body,
        externalLink,
        media{
          mediaType,
          image{
            asset->{
              url
            },
            alt
          },
          video{
            asset->{
              url
            }
          }
        }
      },
      "faqModule": faqModule->{
        title,
        faqs
      },
      splashImage{
        mediaType,
        image{
          asset->{
            _id,
            url
          },
          alt
        },
        video{
          asset->{
            _id,
            url
          }
        }
      }
    } | order(date desc)
  `;
}

export function getUnescapedBioFirstLine(bio?: string | undefined | null) {
  const unescapedBio = bio ? unescape(bio) : '';
  return unescapedBio?.split('\n')[0] ?? '';
}
