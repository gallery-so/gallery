import { Suspense, useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { GalleryViewEmitterFragment$key } from '~/generated/GalleryViewEmitterFragment.graphql';
import { GalleryViewEmitterMutation } from '~/generated/GalleryViewEmitterMutation.graphql';
import { GalleryViewEmitterWithSuspenseFragment$key } from '~/generated/GalleryViewEmitterWithSuspenseFragment.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

type GalleryViewEmitterProps = {
  queryRef: GalleryViewEmitterFragment$key;
};

function GalleryViewEmitter({ queryRef }: GalleryViewEmitterProps) {
  const query = useFragment(
    graphql`
      fragment GalleryViewEmitterFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            galleries {
              dbid
            }
          }
        }

        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const [viewGallery] = usePromisifiedMutation<GalleryViewEmitterMutation>(graphql`
    mutation GalleryViewEmitterMutation($galleryId: DBID!) {
      viewGallery(galleryId: $galleryId) {
        __typename
      }
    }
  `);

  const reportError = useReportError();

  useEffect(() => {
    // Uncomment to skip tracking of anonymous views
    // const isLoggedIn = query.viewer?.user?.dbid;
    // if (!isLoggedIn) {
    //   return;
    // }

    const galleryId = query.userByUsername?.galleries?.[0]?.dbid;

    if (!galleryId) {
      return;
    }

    viewGallery({ variables: { galleryId } }).catch((error) => {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError(
          'Something unexpected went wrong while trying to submit the `viewGallery` mutation'
        );
      }
    });
  }, [query.userByUsername?.galleries, query.viewer?.user?.dbid, reportError, viewGallery]);

  return null;
}

type GalleryViewEmitterWithSuspenseProps = {
  queryRef: GalleryViewEmitterWithSuspenseFragment$key;
};

function GalleryViewEmitterWithSuspense({ queryRef }: GalleryViewEmitterWithSuspenseProps) {
  const query = useFragment(
    graphql`
      fragment GalleryViewEmitterWithSuspenseFragment on Query {
        ...GalleryViewEmitterFragment
      }
    `,
    queryRef
  );

  return (
    <Suspense fallback={null}>
      <GalleryViewEmitter queryRef={query} />
    </Suspense>
  );
}

export default GalleryViewEmitterWithSuspense;
