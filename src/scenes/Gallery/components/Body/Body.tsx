import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';
import CollectionView from './CollectionView';

import useCollections from 'hooks/api/useCollections';
import { User } from 'types/User';

type Props = {
  user: User;
};

function Body({ user }: Props) {
  // TODO__v1: grab collections from real backend, and add a suspense boundary as needed.
  // for example:
  // 1) first request to     /glry/v1/collections/get?username=:username => [{ id: 1 }, { ... }]
  //    -> NFTs will not be populated
  // 2) second request to    /glry/v1/nfts/get_all_for_user?username=:username
  // OR...... (this is preferred)
  // 1) request collections WITH populated NFTs,
  // 2) second request to unassiged NFTs, /glry/v1/nfts/unassigned?username=:username

  const collections = useCollections({ username: user.username });
  if (!collections) {
    return <div>User has no collections</div>;
  }
  return (
    <StyledBody>
      {collections.map((collection, index) => (
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
