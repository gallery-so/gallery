import Head from 'next/head';

import { contexts, flows } from '~/shared/analytics/constants';

import { CmsTypes } from '../cms_types';
import { FeaturePage } from './FeaturePage';

type Props = {
  pageContent: CmsTypes.FeaturePage;
};

export default function PostsFeaturePage({ pageContent }: Props) {
  return (
    <>
      <Head>
        <title>Gallery | Posts</title>
      </Head>
      <PostsFeaturePageContent pageContent={pageContent} />
    </>
  );
}

export function PostsFeaturePageContent({ pageContent }: Props) {
  return (
    <FeaturePage
      pageContent={pageContent}
      ctaAuthenticatedButtonRoute={{ pathname: '/home', query: { composer: 'true' } }}
      eventProperties={{
        eventElementId: 'Posts Feature Page: Get Started',
        eventName: 'Posts Feature Page: Get Started Click',
        eventContext: contexts.Posts,
        eventFlow: flows['Posts Beta Announcement'],
      }}
    />
  );
}
