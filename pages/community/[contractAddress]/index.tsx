import GalleryRoute from 'scenes/_Router/GalleryRoute';
import CommunityPageScene from 'scenes/CommunityPage/CommunityPage';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { MetaTagProps } from 'pages/_app';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { ContractAddressQuery } from '__generated__/ContractAddressQuery.graphql';

type CommunityPageProps = MetaTagProps & {
  contractAddress: string;
};

export const ENABLED_CONTRACTS = [
  '0x5180db8f5c931aae63c74266b211f580155ecac8', // Crypto Coven
  '0xb228d7b6e099618ca71bd5522b3a8c3788a8f172', // Poolsuite Exec
  '0x123214ef2bb526d1b3fb84a6d448985f537d9763', // Poolsuite Pool
  '0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270', // Crypto Citizens
  '0xf64e6fb725f04042b5197e2529b84be4a925902c', // Zen Academy
];

export default function CommunityPage({ contractAddress }: CommunityPageProps) {
  const query = useLazyLoadQuery<ContractAddressQuery>(
    graphql`
      query ContractAddressQuery($contractAddress: Address!) {
        ...CommunityPageFragment
      }
    `,
    { contractAddress }
  );

  if (!contractAddress) {
    // Something went horribly wrong
    return <GalleryRedirect to="/" />;
  }

  if (!ENABLED_CONTRACTS.includes(contractAddress)) {
    return <GalleryRedirect to="/" />;
  }

  return (
    <GalleryRoute
      element={<CommunityPageScene contractAddress={contractAddress} queryRef={query} />}
      footerVisibleOutOfView
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
