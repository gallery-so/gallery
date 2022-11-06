import { Suspense } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { pagesQuery } from '~/generated/pagesQuery.graphql';
import { pagesRedirectFragment$key } from '~/generated/pagesRedirectFragment.graphql';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import LandingPageScene from '~/scenes/LandingPage/LandingPage';

type LandingPageSceneWithRedirectProps = {
  queryRef: pagesRedirectFragment$key;
};

function LandingPageSceneWithRedirect({ queryRef }: LandingPageSceneWithRedirectProps) {
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

  return <LandingPageScene />;
}

export default function Index() {
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
        <Suspense fallback={<LandingPageScene />}>
          <LandingPageSceneWithRedirect queryRef={query} />
        </Suspense>
      }
      navbar={false}
    />
  );
}
