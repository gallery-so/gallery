import { GetServerSideProps } from 'next';
import { route } from 'nextjs-routes';
import { Suspense, useEffect } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { UsernameGalleryViewedMutation } from '~/generated/UsernameGalleryViewedMutation.graphql';
import { UsernameGalleryViewQueryFragment$key } from '~/generated/UsernameGalleryViewQueryFragment.graphql';
import { UsernameQuery } from '~/generated/UsernameQuery.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import { MetaTagProps } from '~/pages/_app';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import useOpenSettingsModal from '~/scenes/Modals/useOpenSettingsModal';
import UserGalleryPage from '~/scenes/UserGalleryPage/UserGalleryPage';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

type UserGalleryProps = MetaTagProps & {
  username: string;
};

type GalleryViewEmitterProps = {
  queryRef: UsernameGalleryViewQueryFragment$key;
};

function GalleryViewEmitter({ queryRef }: GalleryViewEmitterProps) {
  const query = useFragment(
    graphql`
      fragment UsernameGalleryViewQueryFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            galleries {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const [viewGallery] = usePromisifiedMutation<UsernameGalleryViewedMutation>(graphql`
    mutation UsernameGalleryViewedMutation($galleryId: DBID!) {
      viewGallery(galleryId: $galleryId) {
        __typename
      }
    }
  `);

  const reportError = useReportError();

  useEffect(() => {
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
  }, [query.userByUsername?.galleries, reportError, viewGallery]);

  return null;
}

export default function UserGallery({ username }: UserGalleryProps) {
  const query = useLazyLoadQuery<UsernameQuery>(
    graphql`
      query UsernameQuery($username: String!) {
        ...UserGalleryPageFragment
        ...GalleryNavbarFragment
        ...UsernameGalleryViewQueryFragment
        ...useOpenSettingsModalFragment
      }
    `,
    { username }
  );

  useOpenSettingsModal(query);

  return (
    <GalleryRoute
      navbar={<GalleryNavbar username={username} queryRef={query} />}
      element={
        <>
          <Suspense fallback={null}>
            <GalleryViewEmitter queryRef={query} />
          </Suspense>
          <UserGalleryPage username={username} queryRef={query} />
        </>
      }
    />
  );
}

export const getServerSideProps: GetServerSideProps<UserGalleryProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;

  if (!username)
    return {
      redirect: {
        permanent: false,
        destination: route({ pathname: '/' }),
      },
    };

  return {
    props: {
      username,
      metaTags: username
        ? openGraphMetaTags({
            title: `${username} | Gallery`,
            previewPath: `/opengraph/user/${username}`,
          })
        : null,
    },
  };
};
