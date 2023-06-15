import { graphql, useFragment } from 'react-relay';

import { NftSelectorTokenFragment$key } from '~/generated/NftSelectorTokenFragment.graphql';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { RawNftSelectorPreviewAsset } from './RawNftSelectorPreviewAsset';

type Props = {
  tokenRef: NftSelectorTokenFragment$key;
};
export function NftSelectorToken({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment NftSelectorTokenFragment on Token {
        dbid
        name
        contract {
          contractAddress {
            address
          }
        }
        media {
          ... on Media {
            fallbackMedia {
              mediaURL
            }
          }

          ... on SyncingMedia {
            __typename
          }
        }
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  const previewUrlSet = getVideoOrImageUrlForNftPreview({
    tokenRef: token,
    handleReportError: reportError,
  });

  // TODO: handle this error
  if (!previewUrlSet?.urls.small) {
    return null;
    throw new CouldNotRenderNftError('SidebarNftIcon', 'could not find small image url');
  }

  return (
    <RawNftSelectorPreviewAsset
      type={previewUrlSet.type}
      isSelected={false}
      src={previewUrlSet.urls.small}
      onLoad={() => {}}
    />
  );
}
