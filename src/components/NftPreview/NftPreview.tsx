import transitions from 'components/core/transitions';
import { useMemo } from 'react';
import ShimmerProvider, { useContentState } from 'contexts/shimmer/ShimmerContext';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import NftPreviewAsset from './NftPreviewAsset';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useCollectionColumns } from 'hooks/useCollectionColumns';
import Gradient from 'components/core/Gradient/Gradient';
import styled from 'styled-components';
import NftPreviewLabel from './NftPreviewLabel';
import { getBackgroundColorOverrideForContract } from 'utils/nft';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NftPreviewFragment$key } from '__generated__/NftPreviewFragment.graphql';

type Props = {
  galleryNftRef: NftPreviewFragment$key;
};

const SINGLE_COLUMN_NFT_WIDTH = 600;
const MOBILE_NFT_WIDTH = 288;

const LAYOUT_DIMENSIONS: Record<number, number> = {
  1: SINGLE_COLUMN_NFT_WIDTH,
  2: 482,
  3: 308,
  4: 221,
  5: 169,
  6: 134,
};

// simple wrapper component so the child can pull state from ShimmerProvider
function NftPreviewWithShimmer(props: Props) {
  return (
    <ShimmerProvider>
      <NftPreview {...props} />
    </ShimmerProvider>
  );
}

function NftPreview({ galleryNftRef }: Props) {
  const { nft, collection } = useFragment(
    graphql`
      fragment NftPreviewFragment on CollectionToken {
        token @required(action: THROW) {
          dbid
          name
          openseaCollectionName
          contractAddress @required(action: NONE) {
            address
          }
          ...getVideoOrImageUrlForNftPreviewFragment
          ...NftPreviewAssetFragment
        }
        collection @required(action: THROW) {
          id
          dbid
          ...useCollectionColumnsFragment
        }
        ...NftDetailViewFragment
      }
    `,
    galleryNftRef
  );

  const columns = useCollectionColumns(collection);

  // width for rendering so that we request the apprpriate size image.
  const isMobile = useIsMobileWindowWidth();
  const previewSize = isMobile ? MOBILE_NFT_WIDTH : LAYOUT_DIMENSIONS[columns];

  const { aspectRatioType } = useContentState();

  const nftPreviewMaxWidth = useMemo(() => {
    if (columns > 1) return '100%';

    // this could be a 1-liner but wanted to make it explicit
    if (columns === 1) {
      if (isMobile) {
        return '100%';
      }
      if (aspectRatioType === 'wide') {
        return '100%';
      }
      if (aspectRatioType === 'square' || aspectRatioType === 'tall') {
        return '60%';
      }
    }
  }, [columns, aspectRatioType, isMobile]);

  const result = getVideoOrImageUrlForNftPreview(nft);

  const nftPreviewWidth = useMemo(() => {
    // this allows SVGs to stretch to fit its container, fixing images
    // that appeared tiny.
    //
    // HOWEVER, stretching an svg to 100% when column size = 1 results
    // in the preview label appearing stretched beneath the image, since
    // we cap the max height to 80vh when column = 1; so this is disabled
    // in those cases for now.
    if (columns > 1 && result?.urls?.large?.endsWith('.svg')) {
      return '100%';
    }
    return 'auto';
  }, [columns, result?.urls?.large]);

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(nft.contractAddress.address ?? ''),
    [nft.contractAddress.address]
  );

  const {
    pathname,
    query: { username, collectionId },
  } = useRouter();

  // whether the user is on a gallery page or collection page prior to clicking on an NFT
  const originPage = collectionId ? 'collection' : 'gallery';

  return (
    <Link
      // path that will be shown in the browser URL bar
      as={`/${username}/${collection.dbid}/${nft.dbid}`}
      // query params purely for internal tracking. this will NOT be displayed in URL bar.
      // the path will either be `/[username]` or `/[username]/[collectionId]`, with the
      // appropriate query params attached. this allows the app to stay on the current page,
      // while also feeding the modal the necessary data to display an NFT in detail.
      href={`${pathname}?username=${username}&collectionId=${collection.dbid}&nftId=${nft.dbid}&originPage=${originPage}&modal=true`}
      // disable scroll-to-top when the modal opens
      scroll={false}
    >
      {/* NextJS <Link> tags don't come with an anchor tag by default, so we're adding one here.
          This will inherit the `as` URL from the parent component. */}
      <StyledA>
        <StyledNftPreview
          maxWidth={nftPreviewMaxWidth}
          width={nftPreviewWidth}
          backgroundColorOverride={backgroundColorOverride}
        >
          <NftPreviewAsset
            nftRef={nft}
            // we'll request images at double the size of the element so that it looks sharp on retina
            size={previewSize * 2}
          />
          <StyledNftFooter>
            <StyledNftLabel
              title={nft.name}
              collectionName={nft.openseaCollectionName}
              contractAddress={nft.contractAddress.address}
            />
            <StyledGradient type="bottom" direction="down" />
          </StyledNftFooter>
        </StyledNftPreview>
      </StyledA>
    </Link>
  );
}

const StyledA = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const StyledGradient = styled(Gradient)<{ type: 'top' | 'bottom' }>`
  position: absolute;
  ${({ type }) => type}: 0;
`;

const StyledNftLabel = styled(NftPreviewLabel)`
  transition: transform ${transitions.cubic};
  transform: translateY(5px);
`;

const StyledNftFooter = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;

  transition: opacity ${transitions.cubic};

  opacity: 0;
`;

const StyledNftPreview = styled.div<{
  maxWidth?: string;
  width?: string;
  backgroundColorOverride: string;
}>`
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: fit-content;
  overflow: hidden;

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};

  max-height: 80vh;
  max-width: ${({ maxWidth }) => maxWidth};
  width: ${({ width }) => width};

  &:hover ${StyledNftLabel} {
    transform: translateY(0px);
  }

  &:hover ${StyledNftFooter} {
    opacity: 1;
  }
`;

export default NftPreviewWithShimmer;
