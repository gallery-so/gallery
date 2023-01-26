import { GetServerSideProps } from 'next';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { GalleryIdFocusedGalleryQuery } from '~/generated/GalleryIdFocusedGalleryQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import { FocusedGalleryPage } from '~/scenes/UserGalleryPage/FocusedGalleryPage';

type Props = {
  username: string;
  galleryId: string;
};

export default function FocusedGallery({ galleryId, username }: Props) {
  const query = useLazyLoadQuery<GalleryIdFocusedGalleryQuery>(
    graphql`
      query GalleryIdFocusedGalleryQuery($galleryId: DBID!, $username: String!) {
        galleryById(id: $galleryId) @required(action: THROW) {
          ... on Gallery {
            owner {
              username
            }

            ...GalleryNavbarGalleryFragment
          }
        }

        ...GalleryNavbarFragment
        ...FocusedGalleryPageFragment
      }
    `,
    { galleryId, username }
  );

  return (
    <GalleryRoute
      navbar={
        <GalleryNavbar
          showGalleryNameBreadcrumb
          galleryRef={query.galleryById}
          username={query.galleryById?.owner?.username ?? '<error>'}
          queryRef={query}
        />
      }
      element={<FocusedGalleryPage queryRef={query} />}
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  if (typeof params?.galleryId !== 'string' || typeof params?.username !== 'string') {
    return { notFound: true };
  }

  return {
    props: {
      username: params.username,
      galleryId: params.galleryId,
    },
  };
};
