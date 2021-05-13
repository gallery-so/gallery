import styled from 'styled-components';
import { Collection } from 'types/Collection';
import CollectionView from './CollectionView';

type Props = {
  collections: Array<Collection>;
};

function Body({ collections }: Props) {
  return (
    <StyledBody>
      {collections.map((collection) => (
        <CollectionView collection={collection} />
      ))}
    </StyledBody>
  );
}

const StyledBody = styled.div`
  width: 100%;
`;

export default Body;
