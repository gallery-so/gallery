import UserGalleryPage from 'scenes/UserGalleryPage/UserGalleryPage';
import { GetServerSideProps } from 'next';
import { MetaTagProps } from 'pages/_app';
import { openGraphMetaTags } from 'utils/openGraphMetaTags';
import { fetchQuery, graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { UsernameQuery } from '__generated__/UsernameQuery.graphql';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { route } from 'nextjs-routes';
import { PreloadQueryArgs } from 'types/PageComponentPreloadQuery';

const UsernameQueryNode = graphql`
  query UsernameQuery($username: String!) {
    ...UserGalleryPageFragment
  }
`;

type UserGalleryProps = MetaTagProps & {
  username: string;
};

export default function UserGallery({ username }: UserGalleryProps) {
  const query = useLazyLoadQuery<UsernameQuery>(UsernameQueryNode, { username });

  return <GalleryRoute element={<UserGalleryPage username={username} queryRef={query} />} />;
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
