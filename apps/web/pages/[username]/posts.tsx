import { GetServerSideProps } from 'next';
import { loadQuery, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ITEMS_PER_PAGE, MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '~/components/Feed/constants';
import { REPLIES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentNoteSection';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentsModal';
import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { postsQuery } from '~/generated/postsQuery.graphql';
import { MetaTagProps } from '~/pages/_app';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import UserActivityPage from '~/scenes/UserActivityPage/UserActivityPage';
import { COMMUNITIES_PER_PAGE } from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedCommunities';
import { FOLLOWERS_PER_PAGE } from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedInfoList/SharedFollowersList';
import GalleryViewEmitter from '~/shared/components/GalleryViewEmitter';
import { PreloadQueryArgs } from '~/types/PageComponentPreloadQuery';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

const postsQueryNode = graphql`
  query postsQuery(
    $username: String!
    $interactionsFirst: Int!
    $interactionsAfter: String
    $viewerLast: Int!
    $viewerBefore: String
    $visibleTokensPerFeedEvent: Int!
    $topEventId: DBID!
    $sharedCommunitiesFirst: Int
    $sharedCommunitiesAfter: String
    $sharedFollowersFirst: Int
    $sharedFollowersAfter: String
    $replyLast: Int!
    $replyBefore: String
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
  preloadedQuery: PreloadedQuery<postsQuery>;
};

export default function UserFeed({ username, preloadedQuery }: UserActivityProps) {
  const query = usePreloadedQuery<postsQuery>(postsQueryNode, preloadedQuery);

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
    return loadQuery<postsQuery>(
      relayEnvironment,
      postsQueryNode,
      {
        topEventId: query.eventId ?? NON_EXISTENT_FEED_EVENT_ID,
        username: query.username,
        interactionsFirst: NOTES_PER_PAGE,
        viewerLast: ITEMS_PER_PAGE,
        visibleTokensPerFeedEvent: MAX_PIECES_DISPLAYED_PER_FEED_EVENT,
        sharedCommunitiesFirst: COMMUNITIES_PER_PAGE,
        sharedFollowersFirst: FOLLOWERS_PER_PAGE,
        replyLast: REPLIES_PER_PAGE,
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
