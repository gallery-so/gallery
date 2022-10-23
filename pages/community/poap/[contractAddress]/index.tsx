import CommunityPageScene from 'scenes/CommunityPage/CommunityPage';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { MetaTagProps } from 'pages/_app';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { ContractAddressPoapQuery } from '../../../../__generated__/ContractAddressPoapQuery.graphql';

type CommunityPageProps = MetaTagProps & {
  contractAddress: string;
};

export default function CommunityPage({ contractAddress }: CommunityPageProps) {
  const query = useLazyLoadQuery<ContractAddressPoapQuery>(
    graphql`
      query ContractAddressPoapQuery(
        $communityAddress: ChainAddressInput!
        $forceRefresh: Boolean
      ) {
        ...CommunityPageFragment
      }
    `,
    {
      communityAddress: {
        address: contractAddress,
        chain: 'POAP',
      },
      forceRefresh: false,
    }
  );

  if (!contractAddress) {
    // Something went horribly wrong
    return <GalleryRedirect to={{ pathname: '/' }} />;
  }

  return <GalleryRoute element={<CommunityPageScene queryRef={query} />} />;
}

export const getServerSideProps: GetServerSideProps<CommunityPageProps> = async ({ params }) => {
  const contractAddress = params?.contractAddress ? (params.contractAddress as string) : '';
  return {
    props: {
      contractAddress,
    },
  };
};
