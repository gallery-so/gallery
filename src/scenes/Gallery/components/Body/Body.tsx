import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';
import CollectionView from './CollectionView';

import { mockSingleCollection } from 'mocks/collections';

let MOCK_COLLECTIONS = [
  // show multiple rows
  mockSingleCollection({ noVideos: false, withDescription: true, aLot: true }),
  mockSingleCollection({ noVideos: true, withDescription: false }),
  mockSingleCollection({ noVideos: true, withDescription: true }),
];

function Body() {
  // TODO__v1: grab collections from real backend, and add a suspense boundary as needed.
  // for example:
  // 1) first request to     /glry/v1/collections/get?username=:username
  // 2) second request to    /glry/v1/nfts/get_all_for_user?username=:username
  return (
    <StyledBody>
      {MOCK_COLLECTIONS.map((collection, index) => (
        <>
          <Spacer height={index === 0 ? 48 : 108} />
          <CollectionView collection={collection} />
        </>
      ))}
    </StyledBody>
  );
}

const StyledBody = styled.div`
  width: 100%;
`;

export default Body;
