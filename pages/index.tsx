import LandingPageScene from 'scenes/LandingPage/LandingPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { pagesQuery } from '../__generated__/pagesQuery.graphql';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { Suspense } from 'react';
import { pagesRedirectFragment$key } from '../__generated__/pagesRedirectFragment.graphql';

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
    return <GalleryRedirect to="/home" />;
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
        <Suspense fallback={<LandingPageScene />}>
          <LandingPageSceneWithRedirect queryRef={query} />
        </Suspense>
      }
      navbar={false}
    />
  );
}
