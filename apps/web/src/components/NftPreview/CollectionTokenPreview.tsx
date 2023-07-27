import { graphql, useFragment } from 'react-relay';

import { CollectionTokenPreviewFragment$key } from '~/generated/CollectionTokenPreviewFragment.graphql';

import NftPreview from './NftPreview';

type Props = {
  tokenRef: CollectionTokenPreviewFragment$key;
  previewSize: number;
  ownerUsername?: string;
  onClick?: () => void;
  hideLabelOnMobile?: boolean;
  disableLiverender?: boolean;
  columns?: number;
  isInFeedEvent?: boolean;
};

export default function CollectionTokenPreview({
  tokenRef,
  previewSize,
  onClick,
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
  const shouldLiveRender = !!tokenSettings?.renderLive;

  return (
    <NftPreview
      onClick={onClick}
      previewSize={previewSize}
      disableLiverender={disableLiverender}
      columns={columns}
      isInFeedEvent={isInFeedEvent}
      tokenRef={collectionToken.token}
      shouldLiveRender={shouldLiveRender}
      collectionId={collection.dbid}
    />
  );
}
