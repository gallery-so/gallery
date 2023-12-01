import { GetServerSideProps } from 'next';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { REPLIES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentNoteSection';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentsModal';
import { HomeNavbar } from '~/contexts/globalLayout/GlobalNavbar/HomeNavbar/HomeNavbar';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { PostIdStandalonePostQuery } from '~/generated/PostIdStandalonePostQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import StandalonePostPage from '~/scenes/Post/StandalonePostPage';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

type Props = {
  postId: string;
};

export default function StandalonePost({ postId }: Props) {
  const query = useLazyLoadQuery<PostIdStandalonePostQuery>(
    graphql`
      query PostIdStandalonePostQuery(
        $postId: DBID!
        $interactionsFirst: Int!
        $interactionsAfter: String
        $replyLast: Int!
        $replyBefore: String
      ) {
        ...StandardSidebarFragment
        ...StandalonePostPageQueryFragment
        ...HomeNavbarFragment
      }
    `,
    { postId, interactionsFirst: NOTES_PER_PAGE, replyLast: REPLIES_PER_PAGE }
  );

  return (
    <GalleryRoute
      sidebar={<StandardSidebar queryRef={query} />}
      element={<StandalonePostPage queryRef={query} />}
      navbar={<HomeNavbar queryRef={query} />}
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const postId = params?.postId ? (params.postId as string) : '';

  return {
    props: {
      postId,
      metaTags: postId
        ? openGraphMetaTags({
            title: `Gallery`, //todo opengraph title and content
            previewPath: `/opengraph/post/${postId}`,
          })
        : null,
    },
  };
};
