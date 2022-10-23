import Link from 'next/link';
import { useRouter } from 'next/router';
import { route } from 'nextjs-routes';
import { ReactNode } from 'react';

type Props = {
  username: string;
  collectionId: string;
  tokenId: string;
  originPage: string;
  children?: ReactNode;
};

/**
 * This component opens the NFT Detail View as a separate URL but keeps the user where they are,
 * allowing them to share a direct link to the current modal view, while also being able to close
 * the modal and continue browsing.
 */
export default function LinkToNftDetailView({
  children,
  username,
  collectionId,
  tokenId,
  originPage,
}: Props) {
  const { pathname } = useRouter();

  return (
    <Link
      // path that will be shown in the browser URL bar
      as={route({
        pathname: '/[username]/[collectionId]/[tokenId]',
        query: { username, collectionId, tokenId },
      })}
      // query params purely for internal tracking. this will NOT be displayed in URL bar.
      // the path will either be `/[username]` or `/[username]/[collectionId]`, with the
      // appropriate query params attached. this allows the app to stay on the current page,
      // while also feeding the modal the necessary data to display an NFT in detail.
      href={`${pathname}?username=${username}&collectionId=${collectionId}&tokenId=${tokenId}&originPage=${originPage}&modal=true`}
      // disable scroll-to-top when the modal opens
      scroll={false}
      passHref
    >
      {children}
    </Link>
  );
}
