import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';
import PostsFeaturePage from '~/scenes/ContentPages/PostsFeaturePage';
import { fetchSanityContent } from '~/utils/sanity';

type Props = {
  pageContent: CmsTypes.FeaturePage;
};

export default function PostsFeatureRoute({ pageContent }: Props) {
  return <GalleryRoute element={<PostsFeaturePage pageContent={pageContent} />} navbar={false} />;
}

export const getServerSideProps = async () => {
  const query = `
  *[ _type == "featurePage" && id == "posts" ]{
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
    "splashImage": {
      "asset": splashImage.asset->{
        url
      },
      alt
    }
  } | order(date desc)
`;
  const content = await fetchSanityContent(query);

  return {
    props: {
      pageContent: content[0],
    },
  };
};
