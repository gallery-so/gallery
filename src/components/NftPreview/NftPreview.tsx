import transitions from 'components/core/transitions';
import { useCallback, useMemo } from 'react';
import ShimmerProvider, { useContentState } from 'contexts/shimmer/ShimmerContext';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import NftPreviewAsset from './NftPreviewAsset';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useCollectionColumns } from 'hooks/useCollectionColumns';
import Gradient from 'components/core/Gradient/Gradient';
import styled from 'styled-components';
import NftPreviewLabel from './NftPreviewLabel';
import { getBackgroundColorOverrideForContract } from 'utils/token';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NftPreviewFragment$key } from '__generated__/NftPreviewFragment.graphql';

type Props = {
  tokenRef: NftPreviewFragment$key;
  nftPreviewMaxWidth?: string;
  nftPreviewWidth: string;
  previewSize: number;
  ownerUsername?: string;
  onClick?: () => void;
};

function NftPreview({
  tokenRef,
  nftPreviewMaxWidth,
  nftPreviewWidth,
  previewSize,
  onClick,
}: Props) {
  const { token, collection } = useFragment(
    graphql`
      fragment NftPreviewFragment on CollectionToken {
        token @required(action: THROW) {
          dbid
          name
          contract {
            name
            contractAddress {
              address
            }
          }
          ...getVideoOrImageUrlForNftPreviewFragment
          ...NftPreviewAssetFragment
        }
        collection @required(action: THROW) {
          id
          dbid
        }
        ...NftDetailViewFragment
      }
    `,
    tokenRef
  );

  const contractAddress = token.contract?.contractAddress?.address ?? '';

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(contractAddress),
    [contractAddress]
  );

  const {
    pathname,
    query: { username, collectionId },
  } = useRouter();

  // whether the user is on a gallery page or collection page prior to clicking on an NFT
  const originPage = collectionId ? 'home' : 'gallery';
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (onClick) {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <Link
      // path that will be shown in the browser URL bar
      as={`/${username}/${collection.dbid}/${token.dbid}`}
      // query params purely for internal tracking. this will NOT be displayed in URL bar.
      // the path will either be `/[username]` or `/[username]/[collectionId]`, with the
      // appropriate query params attached. this allows the app to stay on the current page,
      // while also feeding the modal the necessary data to display an NFT in detail.
      href={`${pathname}?username=${username}&collectionId=${collection.dbid}&tokenId=${token.dbid}&originPage=${originPage}&modal=true`}
      // disable scroll-to-top when the modal opens
      scroll={false}
    >
      {/* NextJS <Link> tags don't come with an anchor tag by default, so we're adding one here.
          This will inherit the `as` URL from the parent component. */}
      <StyledA onClick={handleClick}>
        <StyledNftPreview
          maxWidth={nftPreviewMaxWidth}
          width={nftPreviewWidth}
          backgroundColorOverride={backgroundColorOverride}
        >
          <NftPreviewAsset
            tokenRef={token}
            // we'll request images at double the size of the element so that it looks sharp on retina
            size={previewSize * 2}
          />
          <StyledNftFooter>
            <StyledNftLabel
              title={token.name}
              collectionName={token.contract?.name}
              contractAddress={contractAddress}
            />
            <StyledGradient type="bottom" direction="down" />
          </StyledNftFooter>
        </StyledNftPreview>
      </StyledA>
    </Link>
  );
}

// const StyledLink = styled(Link)``;

const StyledA = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
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
  // height: fit-content;
  // height: 100%;
  overflow: hidden;

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};


  max-width: ${({ maxWidth }) => maxWidth};
  width: ${({ width }) => width};

  &:hover ${StyledNftLabel} {
    transform: translateY(0px);
  }

  &:hover ${StyledNftFooter} {
    opacity: 1;
  }
`;

export default NftPreview;
