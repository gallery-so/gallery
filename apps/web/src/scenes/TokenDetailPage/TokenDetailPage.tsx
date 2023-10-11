import { ErrorBoundary } from '@sentry/nextjs';
import { Suspense } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import FullPageLoader from '~/components/core/Loader/FullPageLoader';
import { TokenDetailPageQuery } from '~/generated/TokenDetailPageQuery.graphql';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentsModal';

import NotFound from '../NotFound/NotFound';
import TokenDetailView from './TokenDetailView';

type TokenDetailPageProps = {
  tokenId: string;
};
function TokenDetailPage({ tokenId }: TokenDetailPageProps) {
  const query = useLazyLoadQuery<TokenDetailPageQuery>(
    graphql`
      query TokenDetailPageQuery($tokenId: DBID!, $interactionsFirst: Int!,  $interactionsAfter: String) {
        token: tokenById(id: $tokenId) {
          ... on ErrTokenNotFound {
            __typename
          }
          ... on Token {
            __typename
            ...TokenDetailViewFragment
          }
        }
        ...TokenDetailViewQueryFragment
      }
    `,
    { tokenId, interactionsFirst: NOTES_PER_PAGE }
  );

  if (!query.token || query.token.__typename !== 'Token') {
    return (
      <StyledTokenDetailPage>
        <NotFound resource="token" />
      </StyledTokenDetailPage>
    );
  }

  return (
    <StyledTokenDetailPage>
      <TokenDetailView tokenRef={query.token} queryRef={query} />
    </StyledTokenDetailPage>
  );
}

const StyledTokenDetailPage = styled.div`
  width: 100%;
  height: 100vh;

  display: flex;
  justify-content: center;

  @media only screen and ${breakpoints.tablet} {
    align-items: center;
  }
`;

export default function TokenDetailPageWithBoundary({ tokenId }: TokenDetailPageProps) {
  return (
    <StyledTokenDetailPageWithBoundary>
      <Suspense fallback={<FullPageLoader />}>
        <ErrorBoundary>
          <TokenDetailPage tokenId={tokenId} />
        </ErrorBoundary>
      </Suspense>
    </StyledTokenDetailPageWithBoundary>
  );
}

const StyledTokenDetailPageWithBoundary = styled.div`
  width: 100vw;
`;
