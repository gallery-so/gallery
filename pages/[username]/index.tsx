import { GetServerSideProps } from 'next';
import { route } from 'nextjs-routes';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { UsernameQuery } from '~/generated/UsernameQuery.graphql';
import { MetaTagProps } from '~/pages/_app';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import UserGalleryPage from '~/scenes/UserGalleryPage/UserGalleryPage';
import { PreloadQueryArgs } from '~/types/PageComponentPreloadQuery';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

type UserGalleryProps = MetaTagProps & {
  username: string;
};

export default function UserGallery({ username }: UserGalleryProps) {
  const query = useLazyLoadQuery<UsernameQuery>(
    graphql`
      query UsernameQuery($username: String!) {
        ...UserGalleryPageFragment
        ...GalleryNavbarFragment
      }
    `,
    { username }
  );

  return (
    <GalleryRoute
      navbar={<GalleryNavbar username={username} queryRef={query} />}
      element={<UserGalleryPage username={username} queryRef={query} />}
    />
  );
}

UserGallery.preloadQuery = ({ relayEnvironment, query }: PreloadQueryArgs) => {
  if (query.username && typeof query.username === 'string') {
    fetchQuery(relayEnvironment, UsernameQueryNode, { username: query.username }).toPromise();
  }
};

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
