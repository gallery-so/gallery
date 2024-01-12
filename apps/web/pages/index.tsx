import { Suspense } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { pagesQuery } from '~/generated/pagesQuery.graphql';
import { pagesRedirectFragment$key } from '~/generated/pagesRedirectFragment.graphql';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';
import LandingPageScene from '~/scenes/LandingPage/LandingPage';
import { fetchSanityContent } from '~/utils/sanity';

type LandingPageSceneWithRedirectProps = {
  queryRef: pagesRedirectFragment$key;
  pageContent: CmsTypes.LandingPage;
};

function LandingPageSceneWithRedirect({
  queryRef,
  pageContent,
}: LandingPageSceneWithRedirectProps) {
  const query = useFragment(
    graphql`
      fragment pagesRedirectFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }
      }
    `,
    queryRef
  );

  if (query.viewer?.__typename === 'Viewer') {
    return <GalleryRedirect to={{ pathname: '/home' }} />;
  }

  return <LandingPageScene pageContent={pageContent} />;
}

type Props = {
  pageContent: CmsTypes.LandingPage;
};

export default function Index({ pageContent }: Props) {
  const query = useLazyLoadQuery<pagesQuery>(
    graphql`
      query pagesQuery {
        ...pagesRedirectFragment
      }
    `,
    {}
  );

  return (
    <GalleryRoute
      element={
        // The idea here is to show the LandingPageScene when the  LandingPageSceneWithRedirect is loading
        // Basically just show them something while we're determining whether or not they should be redirected
        <Suspense fallback={<LandingPageScene pageContent={pageContent} />}>
          <LandingPageSceneWithRedirect queryRef={query} pageContent={pageContent} />
        </Suspense>
      }
      navbar={false}
      footerTheme="dark"
    />
  );
}

const queryString = `*[_type == "landingPage"]{
  ...,
  "highlight1": highlight1->{
    heading,
    headingFont,
    body,
    media {
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
    },
    orientation
  },
  "miniFeatureHighlights": miniFeatureHighlights[]->{
    heading,
    headingFont,
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
  "testimonials": testimonials[]->{
    pfp{
      asset->{
        url
      }
    },
    username,
    handle,
    date,
    platformIcon,
    caption
  },
  "featuredProfiles": featuredProfiles[]->{
    coverImages[]{
      asset->{
        url
      },
      alt
    },
    pfp{
      asset->{
        url
      },
      alt
    },
    username,
    bio,
    profileType
  }
}`;

export const getServerSideProps = async () => {
  const content = await fetchSanityContent(queryString);

  return {
    props: {
      pageContent: content[0],
    },
  };
};
