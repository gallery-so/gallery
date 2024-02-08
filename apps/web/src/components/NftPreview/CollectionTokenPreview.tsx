import { graphql, useFragment } from 'react-relay';

import { CollectionTokenPreviewFragment$key } from '~/generated/CollectionTokenPreviewFragment.graphql';
import { CollectionTokenPreviewQueryFragment$key } from '~/generated/CollectionTokenPreviewQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { contexts } from '~/shared/analytics/constants';

import NftPreview from './NftPreview';

type Props = {
  queryRef: CollectionTokenPreviewQueryFragment$key;
  tokenRef: CollectionTokenPreviewFragment$key;
  ownerUsername?: string;
  hideLabelOnMobile?: boolean;
  disableLiverender?: boolean;
  columns?: number;
  isInFeedEvent?: boolean;
};

export default function CollectionTokenPreview({
  queryRef,
  tokenRef,
  disableLiverender,
  columns,
  isInFeedEvent,
}: Props) {
  const query = useFragment(
    graphql`
      fragment CollectionTokenPreviewQueryFragment on Query {
        ...NftPreviewQueryFragment
      }
    `,
    queryRef
  );
  const collectionToken = useFragment(
    graphql`
      fragment CollectionTokenPreviewFragment on CollectionToken {
        token @required(action: THROW) {
          __typename
          ...NftPreviewFragment
        }
        tokenSettings {
          renderLive
        }
        collection @required(action: THROW) {
          dbid
        }
      }
    `,
    tokenRef
  );

  const { collection, tokenSettings } = collectionToken;
  const isMobileOrLargeMobile = useIsMobileOrMobileLargeWindowWidth();
  const shouldLiveRender = Boolean(tokenSettings?.renderLive) && !isMobileOrLargeMobile;

  return (
    <NftPreview
      queryRef={query}
      tokenRef={collectionToken.token}
      disableLiverender={disableLiverender}
      columns={columns}
      isInFeedEvent={isInFeedEvent}
      shouldLiveRender={shouldLiveRender}
      collectionId={collection.dbid}
      eventContext={contexts.UserCollection}
      disableBookmarkOnHover
    />
  );
}
