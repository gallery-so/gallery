import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Page from 'components/core/Page/Page';
import Head from 'next/head';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import NotFound from 'scenes/NotFound/NotFound';
import styled from 'styled-components';
import { CommunityPageFragment$key } from '__generated__/CommunityPageFragment.graphql';
import CommunityPageView from './CommunityPageView';

type Props = {
  contractAddress: string;
  queryRef: CommunityPageFragment$key;
};

export default function CommunityPage({ queryRef }: Props) {
  const { community } = useFragment(
    graphql`
      fragment CommunityPageFragment on Query {
        community: communityByAddress(contractAddress: $contractAddress) {
          ... on ErrCommunityNotFound {
            __typename
          }
          ... on Community {
            __typename
            name
            ...CommunityPageViewFragment
          }
        }
      }
    `,
    queryRef
  );

  if (!community || community.__typename !== 'Community') {
    return <NotFound resource="community" />;
  }

  const headTitle = community.name ? `${community.name} | Gallery` : 'Gallery';

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledPage centered>
        <CommunityPageView communityRef={community} />
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
