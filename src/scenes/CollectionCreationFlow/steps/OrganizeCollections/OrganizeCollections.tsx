import { useState } from 'react';
import { mockCollectionsLite } from 'mocks/collections';

import CollectionRow from './CollectionRow';

function OrganizeCollections() {
  const [collections, setCollections] = useState(mockCollectionsLite(3));

  return (
    <div>
      {collections.map((collection) => (
        <CollectionRow
          key={collection.id}
          title="Crypto Punks"
          nfts={collection.nfts}
        />
      ))}
    </div>
  );
}

export default OrganizeCollections;
