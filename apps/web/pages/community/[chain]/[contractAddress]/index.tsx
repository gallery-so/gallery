import { GetServerSideProps } from 'next';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ITEMS_PER_PAGE } from '~/components/Feed/constants';
import { REPLIES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentNoteSection';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentsModal';
import { GRID_ITEM_PER_PAGE, LIST_ITEM_PER_PAGE } from '~/constants/community';
import { CommunityNavbar } from '~/contexts/globalLayout/GlobalNavbar/CommunityNavbar/CommunityNavbar';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { ContractAddressByCommunityKeyQuery } from '~/generated/ContractAddressByCommunityKeyQuery.graphql';
import { Chain } from '~/generated/enums';
import { MetaTagProps } from '~/pages/_app';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import CommunityPageScene from '~/scenes/CommunityPage/CommunityPage';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

type CommunityPageProps = MetaTagProps & {
  contractAddress: string;
  chain: Chain;
};

export default function CommunityPage({ contractAddress, chain }: CommunityPageProps) {
  const query = useLazyLoadQuery<ContractAddressByCommunityKeyQuery>(
    graphql`
      query ContractAddressByCommunityKeyQuery(
        $contractCommunityKey: ContractCommunityKeyInput!
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
        community: contractCommunityByKey(key: $contractCommunityKey) {
          ...CommunityPageCommunityFragment
        }
      }
    `,
    {
      contractCommunityKey: {
        contract: {
          address: contractAddress,
          chain,
        },
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

export const getServerSideProps: GetServerSideProps<CommunityPageProps> = async ({ query }) => {
  const contractAddress = query?.contractAddress ? (query.contractAddress as string) : '';
  const chain = query?.chain as Chain;
  const addOpenGraphMetaTags = contractAddress && chain;

  return {
    props: {
      contractAddress,
      chain,
      metaTags: addOpenGraphMetaTags
        ? openGraphMetaTags({
            title: `${contractAddress} | Gallery`,
            path: `/community/${chain}/${contractAddress}`,
            isFcFrameCompatible: true,
          })
        : null,
    },
  };
};
