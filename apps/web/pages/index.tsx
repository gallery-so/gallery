import { Suspense } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { pagesQuery } from '~/generated/pagesQuery.graphql';
import { pagesRedirectFragment$key } from '~/generated/pagesRedirectFragment.graphql';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import LandingPageScene from '~/scenes/LandingPage/LandingPage';
import { fetchSanityContent } from '~/utils/sanity';

type LandingPageSceneWithRedirectProps = {
  queryRef: pagesRedirectFragment$key;
  pageContent: any;
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
  document: any;
};

export default function Index({ document }: Props) {
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
        <Suspense fallback={<LandingPageScene pageContent={document} />}>
          <LandingPageSceneWithRedirect queryRef={query} pageContent={document} />
        </Suspense>
      }
      navbar={false}
    />
  );
}

const queryString = `*[_type == "landingPage"]{
  ...,
  "highlight1": highlight1->{
    heading,
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
  "highlight2": highlight2->{
    heading,
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
    profileType
  }
}`;

export const getServerSideProps = async () => {
  const content = await fetchSanityContent(queryString);
  // const { req, res } = context;
  console.log('content');
  console.log(content);
  return {
    props: {
      document: content[0],
    },
  };
};
