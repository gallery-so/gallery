import { GetServerSideProps } from 'next';
import { loadQuery, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ITEMS_PER_PAGE, MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '~/components/Feed/constants';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesModal';
import GalleryViewEmitter from '~/components/internal/GalleryViewEmitter';
import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { activityQuery } from '~/generated/activityQuery.graphql';
import { MetaTagProps } from '~/pages/_app';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import UserActivityPage from '~/scenes/UserActivityPage/UserActivityPage';
import { PreloadQueryArgs } from '~/types/PageComponentPreloadQuery';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

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
    ...StandardSidebarFragment
  }
`;

const NON_EXISTENT_FEED_EVENT_ID = 'some-non-existent-feed-event-id';

type UserActivityProps = MetaTagProps & {
  username: string;
  preloadedQuery: PreloadedQuery<activityQuery>;
};

export default function UserFeed({ username, preloadedQuery }: UserActivityProps) {
  const query = usePreloadedQuery<activityQuery>(activityQueryNode, preloadedQuery);

  return (
    <GalleryRoute
      navbar={<GalleryNavbar galleryRef={null} username={username} queryRef={query} />}
      element={
        <>
          <GalleryViewEmitter queryRef={query} />
          <UserActivityPage username={username} queryRef={query} />
        </>
      }
      sidebar={<StandardSidebar queryRef={query} />}
    />
  );
}

UserFeed.preloadQuery = ({ relayEnvironment, query }: PreloadQueryArgs) => {
  if (query.username && typeof query.username === 'string' && !Array.isArray(query.eventId)) {
    return loadQuery<activityQuery>(
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
    );
  }
};

export const getServerSideProps: GetServerSideProps<
  Omit<UserActivityProps, 'preloadedQuery'>
> = async ({ params }) => {
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
