import Link from 'next/link';
import { useRouter } from 'next/router';
import { route } from 'nextjs-routes';
import { ReactNode, useMemo } from 'react';
import styled from 'styled-components';

type Props = {
  username: string;
  tokenId: string;
  children?: ReactNode;
  collectionId?: string;
};

/**
 * IMPORTANT! The mechanics of this file are tied to the globally available `FullPageNftDetailModalListener.tsx`
 *
 * This component opens the NFT Detail View as a separate URL but keeps the user where they are,
 * allowing them to share a direct link to the current modal view, while also being able to close
 * the modal and continue browsing.
 *
 * The NFT Detail variant that will be displayed will be either:
 * 1. Standalone Token Page (e.g. from a Post) OR
 * 2. Collection Token Page, as part of a user's personal collection
 */
export default function LinkToFullPageNftDetailModal({
  children,
  username,
  tokenId,
  collectionId,
}: Props) {
  const { pathname, query, asPath } = useRouter();

  const isCollectionToken = typeof collectionId === 'string' && Boolean(collectionId);

  // query params purely for internal tracking. this will NOT be displayed in URL bar.
  const href = useMemo(() => {
    const rawSearchParams = {
      ...query,
      username,
      tokenId,
      originPage: asPath,
      modal: 'true',
      modalVariant: 'nft_detail',
    };

    if (isCollectionToken) {
      // @ts-expect-error: collectionId will be added to params conditionally
      rawSearchParams.collectionId = collectionId;
    }

    return `${pathname}?${new URLSearchParams(rawSearchParams)}`;
  }, [asPath, collectionId, isCollectionToken, pathname, query, tokenId, username]);

  // path that will be shown in the browser URL bar
  const asRoute = useMemo(() => {
    if (isCollectionToken) {
      return route({
        pathname: '/[username]/[collectionId]/[tokenId]',
        query: { username, collectionId, tokenId },
      });
    }

    return route({
      pathname: '/[username]/token/[tokenId]',
      query: { username, tokenId },
    });
  }, [collectionId, isCollectionToken, tokenId, username]);

  return (
    <Link
      // path that will be shown in the browser URL bar
      as={asRoute}
      // @ts-expect-error href is guaranteed to be be a valid path
      href={href}
      // disable scroll-to-top when the modal opens
      scroll={false}
      passHref
      legacyBehavior
    >
      {/* NextJS <Link> tags don't come with an anchor tag by default, so we're adding one here.
          This will inherit the `as` URL from the parent component. */}
      <StyledAnchor data-tokenid={tokenId}>{children}</StyledAnchor>
    </Link>
  );
}

const StyledAnchor = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: inherit;
  height: inherit;
  text-decoration: none;
`;
