import Spacer from 'components/core/Spacer/Spacer';
import CollectionView from './Collection';

import { Nft } from 'types/Nft';
import useQuery from 'utils/query';

type Collection = {
  nfts: Nft[];
  id: string;
  name?: string;
  description?: string;
};

type Props = {
  collections: Array<Collection>;
};

function Body({ collections }: Props) {
  return (
    <>
      <Spacer height={40} />
      <div>
        {collections.map((collection, i) => (
          <CollectionView
            collection={collection}
            showCollectionDivider={i > 0}
          />
        ))}
      </div>
    </>
  );
}

export default Body;
