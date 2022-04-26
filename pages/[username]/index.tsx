import UserGalleryPage from 'scenes/UserGalleryPage/UserGalleryPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { GetServerSideProps } from 'next';
import { MetaTagProps } from 'pages/_app';
import { openGraphMetaTags } from 'utils/openGraphMetaTags';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { UsernameQuery } from '__generated__/UsernameQuery.graphql';

type UserGalleryProps = MetaTagProps & {
  username: string;
};

export default function UserGallery({ username }: UserGalleryProps) {
  const query = useLazyLoadQuery<UsernameQuery>(
    graphql`
      query UsernameQuery($username: String!) {
        ...GalleryRouteFragment
        ...UserGalleryPageFragment
      }
    `,
    { username }
  );

  return (
    <GalleryRoute
      queryRef={query}
      element={<UserGalleryPage username={username} queryRef={query} />}
    />
  );
}

export const getServerSideProps: GetServerSideProps<UserGalleryProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;

  if (!username)
    return {
      redirect: {
        permanent: false,
        destination: '/',
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
