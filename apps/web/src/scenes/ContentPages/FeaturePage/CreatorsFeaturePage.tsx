import Head from 'next/head';

import { contexts } from '~/shared/analytics/constants';

import { CmsTypes } from '../cms_types';
import { FeaturePage } from './FeaturePage';

type Props = {
  pageContent: CmsTypes.FeaturePage;
};

export default function PostsFeaturePage({ pageContent }: Props) {
  return (
    <>
      <Head>
        <title>Gallery | Creators</title>
      </Head>
      <CreatorsFeaturePageContent pageContent={pageContent} />
    </>
  );
}

export function CreatorsFeaturePageContent({ pageContent }: Props) {
  return (
    <FeaturePage
      pageContent={pageContent}
      ctaAuthenticatedButtonRoute={{ pathname: '/home', query: { composer: 'true' } }}
      eventProperties={{
        eventElementId: 'Creators Feature Page: Get Started',
        eventName: 'Creators Feature Page: Get Started Click',
        eventContext: contexts.Posts,
      }}
    />
  );
}
