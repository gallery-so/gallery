import { GetServerSideProps } from 'next';
import { MetaTagProps } from 'pages/_app';
import { openGraphMetaTags } from 'utils/openGraphMetaTags';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { activityQuery } from '__generated__/activityQuery.graphql';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import UserActivityPage from 'scenes/UserActivityPage/UserActivityPage';

type UserActivityProps = MetaTagProps & {
  username: string;
};

export default function UserFeed({ username }: UserActivityProps) {
  const query = useLazyLoadQuery<activityQuery>(
    graphql`
      query activityQuery($username: String!) {
        ...UserActivityPageFragment
      }
    `,
    { username }
  );

  return <GalleryRoute element={<UserActivityPage username={username} queryRef={query} />} />;
}

export const getServerSideProps: GetServerSideProps<UserActivityProps> = async ({ params }) => {
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
