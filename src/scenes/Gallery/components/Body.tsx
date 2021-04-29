import Spacer from 'components/core/Spacer/Spacer';
import CollectionView from './CollectionView';

import { Collection } from 'types/Collection';

type Props = {
  collections: Array<Collection>;
};

function Body({ collections }: Props) {
  return (
    <>
      <Spacer height={40} />
      <div>
        {collections.map((collection) => (
          <CollectionView collection={collection} />
        ))}
      </div>
    </>
  );
}

export default Body;
