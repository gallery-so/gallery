import { GetServerSideProps } from 'next';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ITEMS_PER_PAGE, MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '~/components/Feed/constants';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesModal';
import GalleryViewEmitter from '~/components/internal/GalleryViewEmitter';
import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { activityQuery } from '~/generated/activityQuery.graphql';
import { MetaTagProps } from '~/pages/_app';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import UserActivityPage from '~/scenes/UserActivityPage/UserActivityPage';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

type UserActivityProps = MetaTagProps & {
  username: string;
  eventId: string | null;
};

export default function UserFeed({ username, eventId }: UserActivityProps) {
  const query = useLazyLoadQuery<activityQuery>(
    graphql`
      query activityQuery(
        $username: String!
        $interactionsFirst: Int!
        $interactionsAfter: String
        $viewerLast: Int!
        $viewerBefore: String
        $visibleTokensPerFeedEvent: Int!
        $topEventId: DBID!
      ) {
        ...UserActivityPageFragment
        ...GalleryNavbarFragment
        ...GalleryViewEmitterWithSuspenseFragment
      }
    `,
    {
      username: username,
      viewerLast: ITEMS_PER_PAGE,
      interactionsFirst: NOTES_PER_PAGE,
      topEventId: eventId ?? 'some-non-existent-feed-event-id',
      visibleTokensPerFeedEvent: MAX_PIECES_DISPLAYED_PER_FEED_EVENT,
    }
  );

  return (
    <GalleryRoute
      navbar={<GalleryNavbar username={username} queryRef={query} />}
      element={
        <>
          <GalleryViewEmitter queryRef={query} />
          <UserActivityPage username={username} queryRef={query} />
        </>
      }
    />
  );
}

export const getServerSideProps: GetServerSideProps<UserActivityProps> = async ({
  params,
  query,
}) => {
  const username = params?.username ? (params.username as string) : undefined;
  const eventId = (query?.eventId ?? null) as string | null;

  if (!username)
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };

  return {
    props: {
      eventId,
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
