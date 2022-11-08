import { GetServerSideProps } from 'next';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GRID_ITEM_PER_PAGE, LIST_ITEM_PER_PAGE } from '~/constants/community';
import { CommunityNavbar } from '~/contexts/globalLayout/GlobalNavbar/CommunityNavbar/CommunityNavbar';
import { ContractAddressTezosQuery } from '~/generated/ContractAddressTezosQuery.graphql';
import { MetaTagProps } from '~/pages/_app';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import CommunityPageScene from '~/scenes/CommunityPage/CommunityPage';

type CommunityPageProps = MetaTagProps & {
  contractAddress: string;
};

export default function CommunityPage({ contractAddress }: CommunityPageProps) {
  const query = useLazyLoadQuery<ContractAddressTezosQuery>(
    graphql`
      query ContractAddressTezosQuery(
        $communityAddress: ChainAddressInput!
        $forceRefresh: Boolean
        $tokenCommunityFirst: Int!
        $tokenCommunityAfter: String
        $listOwnersFirst: Int!
        $listOwnersAfter: String
        $onlyGalleryUsers: Boolean
      ) {
        ...CommunityPageFragment
        ...CommunityNavbarFragment
      }
    `,
    {
      communityAddress: {
        address: contractAddress,
        chain: 'Tezos',
      },
      forceRefresh: false,
      tokenCommunityFirst: GRID_ITEM_PER_PAGE,
      listOwnersFirst: LIST_ITEM_PER_PAGE,
      onlyGalleryUsers: true,
    }
  );

  if (!contractAddress) {
    // Something went horribly wrong
    return <GalleryRedirect to={{ pathname: '/' }} />;
  }

  return (
    <GalleryRoute
      navbar={<CommunityNavbar queryRef={query} />}
      element={<CommunityPageScene queryRef={query} />}
    />
  );
}

export const getServerSideProps: GetServerSideProps<CommunityPageProps> = async ({ params }) => {
  const contractAddress = params?.contractAddress ? (params.contractAddress as string) : '';
  return {
    props: {
      contractAddress,
    },
  };
};
