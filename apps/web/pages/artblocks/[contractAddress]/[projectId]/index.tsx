import { GetServerSideProps } from 'next';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ITEMS_PER_PAGE } from '~/components/Feed/constants';
import { REPLIES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentNoteSection';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentsModal';
import { GRID_ITEM_PER_PAGE, LIST_ITEM_PER_PAGE } from '~/constants/community';
import { CommunityNavbar } from '~/contexts/globalLayout/GlobalNavbar/CommunityNavbar/CommunityNavbar';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { ProjectIdArtBlocksCommunityByKeyQuery } from '~/generated/ProjectIdArtBlocksCommunityByKeyQuery.graphql';
import { MetaTagProps } from '~/pages/_app';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import CommunityPageScene from '~/scenes/CommunityPage/CommunityPage';

type ArtBlocksCommunityPageProps = MetaTagProps & {
  contractAddress: string;
  projectId: string;
};

export default function ArtBlocksCommunityPage({
  contractAddress,
  projectId,
}: ArtBlocksCommunityPageProps) {
  const query = useLazyLoadQuery<ProjectIdArtBlocksCommunityByKeyQuery>(
    graphql`
      query ProjectIdArtBlocksCommunityByKeyQuery(
        $artBlocksCommunityKey: ArtBlocksCommunityKeyInput!
        $tokenCommunityFirst: Int!
        $tokenCommunityAfter: String
        $listOwnersFirst: Int!
        $listOwnersAfter: String
        $communityPostsLast: Int!
        $communityPostsBefore: String
        $interactionsFirst: Int!
        $interactionsAfter: String
        $visibleTokensPerFeedEvent: Int!
        $replyLast: Int!
        $replyBefore: String
      ) {
        ...CommunityPageFragment
        ...CommunityNavbarFragment
        ...StandardSidebarFragment
        community: artBlocksCommunityByKey(key: $artBlocksCommunityKey) {
          ...CommunityPageCommunityFragment
        }
      }
    `,
    {
      artBlocksCommunityKey: {
        contract: {
          address: contractAddress,
          chain: 'Ethereum',
        },
        projectID: projectId,
      },
      tokenCommunityFirst: GRID_ITEM_PER_PAGE,
      listOwnersFirst: LIST_ITEM_PER_PAGE,
      communityPostsLast: ITEMS_PER_PAGE,
      interactionsFirst: NOTES_PER_PAGE,
      visibleTokensPerFeedEvent: 1,
      replyLast: REPLIES_PER_PAGE,
    }
  );

  if (!contractAddress) {
    // Something went horribly wrong
    return <GalleryRedirect to={{ pathname: '/' }} />;
  }

  return (
    <GalleryRoute
      navbar={<CommunityNavbar queryRef={query} />}
      element={<CommunityPageScene queryRef={query} communityRef={query.community} />}
      sidebar={<StandardSidebar queryRef={query} />}
    />
  );
}

export const getServerSideProps: GetServerSideProps<ArtBlocksCommunityPageProps> = async ({
  query,
}) => {
  const contractAddress = query?.contractAddress ? (query.contractAddress as string) : '';
  const projectId = query?.projectId ? (query.projectId as string) : '';

  return {
    props: {
      contractAddress,
      projectId,
    },
  };
};
