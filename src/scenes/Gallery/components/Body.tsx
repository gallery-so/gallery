import Spacer from 'components/core/Spacer/Spacer';
import CollectionView from './CollectionView';

import { Collection } from 'types/Collection';
import useQuery from 'utils/query';

type Props = {
  collections: Array<Collection>;
};

function Body({ collections }: Props) {
  return (
    <>
      <Spacer height={40} />
      <div>
        {collections.map((collection, i) => (
          <CollectionView collection={collection} />
        ))}
      </div>
    </>
  );
}

export default Body;
