import { Collection } from 'types/Collection';
import SortableCollectionRow from './SortableCollectionRow';
import Spacer from 'components/core/Spacer/Spacer';

type Props = {
  collection: Collection;
};

function CollectionRowWrapper({ collection }: Props) {
  return (
    //   TODO: add button here
    <>
      <SortableCollectionRow collection={collection} />
      <Spacer height={32}></Spacer>
    </>
  );
}

export default CollectionRowWrapper;
