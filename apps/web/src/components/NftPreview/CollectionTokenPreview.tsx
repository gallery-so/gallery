import { graphql, useFragment } from 'react-relay';

import { CollectionTokenPreviewFragment$key } from '~/generated/CollectionTokenPreviewFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

import NftPreview from './NftPreview';

type Props = {
  tokenRef: CollectionTokenPreviewFragment$key;
  ownerUsername?: string;
  hideLabelOnMobile?: boolean;
  disableLiverender?: boolean;
  columns?: number;
  isInFeedEvent?: boolean;
};

export default function CollectionTokenPreview({
  tokenRef,
  disableLiverender,
  columns,
  isInFeedEvent,
}: Props) {
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
      disableLiverender={disableLiverender}
      columns={columns}
      isInFeedEvent={isInFeedEvent}
      tokenRef={collectionToken.token}
      shouldLiveRender={shouldLiveRender}
      collectionId={collection.dbid}
    />
  );
}
