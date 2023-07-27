import { ErrorBoundary } from '@sentry/nextjs';
import Head from 'next/head';
import { Suspense, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import FullPageLoader from '~/components/core/Loader/FullPageLoader';
import { StandalonePostPageQueryFragment$key } from '~/generated/StandalonePostPageQueryFragment.graphql';
import { GalleryPageSpacing } from '~/pages/[username]';

import NotFound from '../NotFound/NotFound';
import StandalonePostView from './StandalonePostView';

type Props = {
  queryRef: StandalonePostPageQueryFragment$key;
};

function StandalonePostPage({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment StandalonePostPageQueryFragment on Query {
        postById(id: $postId) {
          ... on Post {
            author @required(action: THROW) {
              username
            }
            caption
            tokens {
              name
            }
            ...StandalonePostViewFragment
          }
        }
        ...StandalonePostViewQueryFragment
      }
    `,
    queryRef
  );

  const post = query?.postById;

  const headTitle = useMemo(() => {
    if (!post) {
      return 'Gallery';
    }
    const token = post.tokens && post.tokens[0];

    if (post.caption) {
      return `${post.author?.username} on Gallery: "${post.caption.slice(0, 30)}"`;
    }

    return token
      ? `${post.author?.username} on Gallery: Shared "${token.name}"`
      : `${post.author?.username} on Gallery`;
  }, [post]);

  if (!post) {
    return (
      <GalleryPageSpacing>
        <NotFound resource="post" />
      </GalleryPageSpacing>
    );
  }

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <GalleryPageSpacing>
        <StandalonePostView postRef={post} queryRef={query} />
      </GalleryPageSpacing>
    </>
  );
}

export default function StandalonePostPageWithBoundary({ queryRef }: Props) {
  return (
    <div>
      <Suspense fallback={<FullPageLoader />}>
        <ErrorBoundary>
          <StandalonePostPage queryRef={queryRef} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
