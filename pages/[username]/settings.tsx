import { GetServerSideProps } from 'next';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { settingsQuery } from '~/generated/settingsQuery.graphql';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import UserSettingsPage from '~/scenes/UserSettingsPage/UserSettingsPage';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

import { MetaTagProps } from '../_app';

type UserSettingsProps = MetaTagProps & {
  username: string;
};

export default function Settings({ username }: UserSettingsProps) {
  const query = useLazyLoadQuery<settingsQuery>(
    graphql`
      query settingsQuery($username: String!) {
        ...GalleryNavbarFragment
        ...UserSettingsPageFragment

        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    { username }
  );

  const loggedInUser = query.viewer?.user?.username;

  if (loggedInUser !== username) {
    return <GalleryRedirect to={{ pathname: '/home' }} />;
  }

  return (
    <GalleryRoute
      navbar={<GalleryNavbar username={username} queryRef={query} />}
      element={<UserSettingsPage username={username} queryRef={query} />}
    />
  );
}

export const getServerSideProps: GetServerSideProps<UserSettingsProps> = async ({ params }) => {
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
