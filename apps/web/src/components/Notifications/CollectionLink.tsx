import { Route, route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { CollectionLinkFragment$key } from '~/generated/CollectionLinkFragment.graphql';

type CollectionLinkProps = {
  collectionRef: CollectionLinkFragment$key;
};

export function CollectionLink({ collectionRef }: CollectionLinkProps) {
  const collection = useFragment(
    graphql`
      fragment CollectionLinkFragment on Collection {
        dbid
        name
        gallery {
          owner {
            username
          }
        }
      }
    `,
    collectionRef
  );

  const collectionRoute = useMemo((): Route | null => {
    if (collection.gallery?.owner?.username) {
      return {
        pathname: '/[username]/[collectionId]',
        query: { collectionId: collection.dbid, username: collection.gallery.owner.username },
      };
    }

    return null;
  }, [collection.dbid, collection.gallery?.owner?.username]);

  if (!collectionRoute) {
    throw new Error('CollectionLink rendered without a valid collection url');
  }

  return (
    <GalleryLink href={route(collectionRoute)}>{collection.name || 'your collection'}</GalleryLink>
  );
}
