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

type CommunityPageProps = MetaTagProps & {
  contractAddress: string;
};

export default function CommunityPage({ contractAddress }: CommunityPageProps) {
  const query = useLazyLoadQuery<ContractAddressQuery>(
    graphql`
      query ContractAddressQuery($communityAddress: ChainAddressInput!, $forceRefresh: Boolean) {
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
    }
  );

  if (!contractAddress) {
    // Something went horribly wrong
    return <GalleryRedirect to="/" />;
  }

  if (DISABLED_CONTRACTS.includes(contractAddress)) {
    return <GalleryRedirect to="/" />;
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
