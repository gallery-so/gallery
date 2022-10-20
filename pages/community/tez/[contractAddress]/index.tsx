import CommunityPageScene from 'scenes/CommunityPage/CommunityPage';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { MetaTagProps } from 'pages/_app';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { ContractAddressTezosQuery } from '../../../../__generated__/ContractAddressTezosQuery.graphql';
import { CommunityNavbar } from 'contexts/globalLayout/GlobalNavbar/CommunityNavbar/CommunityNavbar';

type CommunityPageProps = MetaTagProps & {
  contractAddress: string;
};

export default function CommunityPage({ contractAddress }: CommunityPageProps) {
  const query = useLazyLoadQuery<ContractAddressTezosQuery>(
    graphql`
      query ContractAddressTezosQuery(
        $communityAddress: ChainAddressInput!
        $forceRefresh: Boolean
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
    }
  );

  if (!contractAddress) {
    // Something went horribly wrong
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
