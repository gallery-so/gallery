import { GetServerSideProps } from 'next';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ITEMS_PER_PAGE } from '~/components/Feed/constants';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesModal';
import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { activityQuery } from '~/generated/activityQuery.graphql';
import { MetaTagProps } from '~/pages/_app';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import UserActivityPage from '~/scenes/UserActivityPage/UserActivityPage';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

type UserActivityProps = MetaTagProps & {
  username: string;
};

export default function UserFeed({ username }: UserActivityProps) {
  const query = useLazyLoadQuery<activityQuery>(
    graphql`
      query activityQuery(
        $username: String!
        $interactionsFirst: Int!
        $interactionsAfter: String
        $viewerLast: Int!
        $viewerBefore: String
      ) {
        ...UserActivityPageFragment
        ...GalleryNavbarFragment
      }
    `,
    {
      username: username,
      interactionsFirst: NOTES_PER_PAGE,
      viewerLast: ITEMS_PER_PAGE,
    }
  );

  return (
    <GalleryRoute
      navbar={<GalleryNavbar username={username} queryRef={query} />}
      element={<UserActivityPage username={username} queryRef={query} />}
    />
  );
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
