import transitions from 'components/core/transitions';
import { useCallback, useMemo } from 'react';
import NftPreviewAsset from './NftPreviewAsset';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import Gradient from 'components/core/Gradient/Gradient';
import styled from 'styled-components';
import NftPreviewLabel from './NftPreviewLabel';
import { getBackgroundColorOverrideForContract } from 'utils/token';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NftPreviewFragment$key } from '__generated__/NftPreviewFragment.graphql';
import NftDetailVideo from 'scenes/NftDetailPage/NftDetailVideo';
import NftDetailAnimation from 'scenes/NftDetailPage/NftDetailAnimation';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { useCollectionColumns } from 'hooks/useCollectionColumns';
import isFirefox from 'utils/isFirefox';
import isSvg from 'utils/isSvg';

type Props = {
  tokenRef: NftPreviewFragment$key;
  nftPreviewMaxWidth?: string;
  previewSize: number;
  ownerUsername?: string;
  onClick?: () => void;
  hideLabelOnMobile?: boolean;
  disableLiverender?: boolean;
};

function NftPreview({
  tokenRef,
  nftPreviewMaxWidth,
  previewSize,
  onClick,
  hideLabelOnMobile = false,
  disableLiverender = false,
}: Props) {
  const { token, collection, tokenSettings } = useFragment(
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
          media {
            ... on VideoMedia {
              __typename
              ...NftDetailVideoFragment
            }
            ... on HtmlMedia {
              __typename
            }
            ... on UnknownMedia {
              __typename
            }
          }
          ...getVideoOrImageUrlForNftPreviewFragment
          ...NftPreviewAssetFragment
          ...NftDetailAnimationFragment
        }
        tokenSettings {
          renderLive
        }
        collection @required(action: THROW) {
          id
          dbid
          gallery {
            owner {
              username
            }
          }
          ...useCollectionColumnsFragment
        }
        ...NftDetailViewFragment
      }
    `,
    tokenRef
  );

  const username = collection.gallery?.owner?.username;
  const collectionId = collection.dbid;
  const contractAddress = token.contract?.contractAddress?.address ?? '';

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(contractAddress),
    [contractAddress]
  );

  const { pathname } = useRouter();

  // whether the user is on a gallery page or collection page prior to clicking on an NFT
  const originPage = collectionId ? 'home' : 'gallery';
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (onClick && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  const shouldLiverender = tokenSettings?.renderLive;

  const PreviewAsset = useMemo(() => {
    if (disableLiverender) {
      return (
        <NftPreviewAsset
          tokenRef={token}
          // we'll request images at double the size of the element so that it looks sharp on retina
          size={previewSize * 2}
        />
      );
    }
    if (shouldLiverender && token.media?.__typename === 'VideoMedia') {
      return <NftDetailVideo mediaRef={token.media} hideControls />;
    }
    if (shouldLiverender && token.media?.__typename === 'HtmlMedia') {
      return <NftDetailAnimation mediaRef={token} />;
    }

    return (
      <NftPreviewAsset
        tokenRef={token}
        // we'll request images at double the size of the element so that it looks sharp on retina
        size={previewSize * 2}
      />
    );
  }, [disableLiverender, shouldLiverender, previewSize, token]);

  const columns = useCollectionColumns(collection);

  // don't stretch to full width if column count is 1, as that causes the gradient to stretch...
  // unless it's an SVG and the user is on safari, of course.
  const result = getVideoOrImageUrlForNftPreview(token);
  const isFirefoxSvg = isSvg(result?.urls?.large) && isFirefox();
  const fullWidth = columns > 1 || isFirefoxSvg;

  return (
    <Link
      // path that will be shown in the browser URL bar
      as={`/${username}/${collectionId}/${token.dbid}`}
      // query params purely for internal tracking. this will NOT be displayed in URL bar.
      // the path will either be `/[username]` or `/[username]/[collectionId]`, with the
      // appropriate query params attached. this allows the app to stay on the current page,
      // while also feeding the modal the necessary data to display an NFT in detail.
      href={`${pathname}?username=${username}&collectionId=${collectionId}&tokenId=${token.dbid}&originPage=${originPage}&modal=true`}
      // disable scroll-to-top when the modal opens
      scroll={false}
      passHref
    >
      {/* NextJS <Link> tags don't come with an anchor tag by default, so we're adding one here.
          This will inherit the `as` URL from the parent component. */}
      <StyledA onClick={handleClick}>
        <StyledNftPreview
          maxWidth={nftPreviewMaxWidth}
          backgroundColorOverride={backgroundColorOverride}
          fullWidth={fullWidth}
        >
          {PreviewAsset}
          {hideLabelOnMobile ? null : (
            <StyledNftFooter>
              <StyledNftLabel
                title={token.name}
                collectionName={token.contract?.name}
                contractAddress={contractAddress}
              />
              <StyledGradient type="bottom" direction="down" />
            </StyledNftFooter>
          )}
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
  text-decoration: none;
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
  fullWidth: boolean;
}>`
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  max-height: 80vh;

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};

  max-width: ${({ maxWidth }) => maxWidth};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  &:hover ${StyledNftLabel} {
    transform: translateY(0px);
  }

  &:hover ${StyledNftFooter} {
    opacity: 1;
  }
`;

export default NftPreview;
