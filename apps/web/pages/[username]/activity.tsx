import { GetServerSideProps } from 'next';
import { useLazyLoadQuery } from 'react-relay';
import { fetchQuery, graphql } from 'relay-runtime';

import { ITEMS_PER_PAGE, MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '~/components/Feed/constants';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesModal';
import GalleryViewEmitter from '~/components/internal/GalleryViewEmitter';
import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { activityQuery } from '~/generated/activityQuery.graphql';
import { MetaTagProps } from '~/pages/_app';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import UserActivityPage from '~/scenes/UserActivityPage/UserActivityPage';
import { PreloadQueryArgs } from '~/types/PageComponentPreloadQuery';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

type UserActivityProps = MetaTagProps & {
  username: string;
  eventId: string | null;
};

const activityQueryNode = graphql`
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
`;

const NON_EXISTENT_FEED_EVENT_ID = 'some-non-existent-feed-event-id';

export default function UserFeed({ username, eventId }: UserActivityProps) {
  const query = useLazyLoadQuery<activityQuery>(activityQueryNode, {
    username: username,
    viewerLast: ITEMS_PER_PAGE,
    interactionsFirst: NOTES_PER_PAGE,
    topEventId: eventId ?? NON_EXISTENT_FEED_EVENT_ID,
    visibleTokensPerFeedEvent: MAX_PIECES_DISPLAYED_PER_FEED_EVENT,
  });

  return (
    <GalleryRoute
      navbar={<GalleryNavbar galleryRef={null} username={username} queryRef={query} />}
      element={
        <>
          <GalleryViewEmitter queryRef={query} />
          <UserActivityPage username={username} queryRef={query} />
        </>
      }
    />
  );
}

UserFeed.preloadQuery = ({ relayEnvironment, query }: PreloadQueryArgs) => {
  if (query.username && typeof query.username === 'string' && !Array.isArray(query.eventId)) {
    fetchQuery<activityQuery>(
      relayEnvironment,
      activityQueryNode,
      {
        topEventId: query.eventId ?? NON_EXISTENT_FEED_EVENT_ID,
        username: query.username,
        interactionsFirst: NOTES_PER_PAGE,
        viewerLast: ITEMS_PER_PAGE,
        visibleTokensPerFeedEvent: MAX_PIECES_DISPLAYED_PER_FEED_EVENT,
      },
      { fetchPolicy: 'store-or-network' }
    ).toPromise();
  }
};

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
