import CommunityPageScene from 'scenes/CommunityPage/CommunityPage';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { MetaTagProps } from 'pages/_app';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { ContractAddressQuery } from '__generated__/ContractAddressQuery.graphql';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { DISABLED_CONTRACTS } from 'utils/getCommunityUrlForToken';
import { CommunityNavbar } from 'contexts/globalLayout/GlobalNavbar/CommunityNavbar/CommunityNavbar';
import {
  GRID_ENABLED_COMMUNITY_ADDRESSES,
  GRID_ITEM_PER_PAGE,
  LIST_ITEM_PER_PAGE,
} from 'constants/community';

type CommunityPageProps = MetaTagProps & {
  contractAddress: string;
};

export default function CommunityPage({ contractAddress }: CommunityPageProps) {
  const fetchUniversalOwners = GRID_ENABLED_COMMUNITY_ADDRESSES.includes(contractAddress);

  const query = useLazyLoadQuery<ContractAddressQuery>(
    graphql`
      query ContractAddressQuery(
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
        chain: 'Ethereum',
      },
      forceRefresh: false,
      tokenCommunityFirst: GRID_ITEM_PER_PAGE,
      listOwnersFirst: LIST_ITEM_PER_PAGE,
      onlyGalleryUsers: !fetchUniversalOwners,
    }
  );

  if (!contractAddress) {
    // Something went horribly wrong
    return <GalleryRedirect to={{ pathname: '/' }} />;
  }

  if (DISABLED_CONTRACTS.includes(contractAddress)) {
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
