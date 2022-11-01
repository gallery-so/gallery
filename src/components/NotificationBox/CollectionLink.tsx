import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionLinkFragment$key } from '__generated__/CollectionLinkFragment.graphql';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { useMemo } from 'react';
import { route, Route } from 'nextjs-routes';

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
    <InteractiveLink href={route(collectionRoute)}>
      {collection.name ?? 'Collection'}
    </InteractiveLink>
  );
}
