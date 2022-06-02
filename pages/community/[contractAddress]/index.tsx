import CommunityPageScene from 'scenes/CommunityPage/CommunityPage';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { MetaTagProps } from 'pages/_app';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { ContractAddressQuery } from '__generated__/ContractAddressQuery.graphql';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

type CommunityPageProps = MetaTagProps & {
  contractAddress: string;
};

export const DISABLED_CONTRACTS = [
  '0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270', // Art Blocks
  '0x495f947276749ce646f68ac8c248420045cb7b5e', // OS
  '0xf6793da657495ffeff9ee6350824910abc21356c', // Rarible
  '0x3b3ee1931dc30c1957379fac9aba94d1c48a5405', // Foundation
  '0xdfde78d2baec499fe18f2be74b6c287eed9511d7', // Braindrops
];

export default function CommunityPage({ contractAddress }: CommunityPageProps) {
  const query = useLazyLoadQuery<ContractAddressQuery>(
    graphql`
      query ContractAddressQuery($communityAddress: ChainAddressInput!, $forceRefresh: Boolean) {
        ...CommunityPageFragment
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
      element={<CommunityPageScene contractAddress={contractAddress} queryRef={query} />}
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
