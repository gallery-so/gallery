import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Page from 'components/core/Page/Page';
import useGet from 'hooks/api/_rest/useGet';
import Head from 'next/head';
import NotFound from 'scenes/NotFound/NotFound';
import styled from 'styled-components';
import { Community } from 'types/Community';
import CommunityPageView from './CommunityPageView';

type Props = {
  contractAddress: string;
};

type GetCommunityResponse = { community: Community };

function useCommunityByContractAddress(contractAddress: string): Community | undefined {
  const data = useGet<GetCommunityResponse>(
    contractAddress ? `/communities/get?contract_address=${contractAddress}` : null,
    'fetch community by contract address'
  );

  return data?.community;
}

export default function CommunityPage({ contractAddress }: Props) {
  const community = useCommunityByContractAddress(contractAddress);

  // this will be used when we're on graphql - right now useGet throws an error earlier if not found
  if (!community) {
    return <NotFound resource="community" />;
  }

  const headTitle = `${contractAddress} | Gallery`;
  return (
    <>
      <Head>{headTitle}</Head>
      <StyledPage centered>
        <CommunityPageView community={community} />
      </StyledPage>
    </>
  );
}

const StyledPage = styled(Page)`
  margin-left: ${pageGutter.mobile}px;
  margin-right: ${pageGutter.mobile}px;
  justify-content: flex-start;
  max-width: 100vw;

  @media only screen and ${breakpoints.tablet} {
    margin-left: ${pageGutter.tablet}px;
    margin-right: ${pageGutter.tablet}px;
  }

  @media only screen and ${breakpoints.desktop} {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px;
  }
`;
