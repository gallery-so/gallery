import { useCallback, useEffect, useMemo, useState } from 'react';
import { navigate, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';

import { Nft } from 'types/Nft';
import { Collection } from 'types/Collection';

import breakpoints, { pageGutter } from 'components/core/breakpoints';
import ActionText from 'components/core/ActionText/ActionText';
import { mockSingleCollection } from 'mocks/collections';
import NftDetailLabel from './NftDetailLabel';
import NftDetailAsset from './NftDetailAsset';

import { getMockNftById } from 'mocks/nfts';

type Params = {
  collectionId: string;
  nftId: string;
};

// for now you can visit on http://localhost:3000/test/test/123
function NftDetailPage({
  collectionId,
  nftId,
  location,
}: RouteComponentProps<Params>) {
  const [nft, setNft] = useState<Nft | null>(null);
  const [collection, setCollection] = useState<Collection>({
    nfts: [],
    id: '1',
  });

  useEffect(() => {
    console.log(
      'check for collection on location state, otherwise GET collection',
      collectionId,
      nftId
    );
    setCollection(mockSingleCollection());
  }, [collectionId, nftId]);

  useEffect(() => {
    console.log('GET nft and collection', collectionId, nftId);
    if (nftId) {
      setNft(getMockNftById(nftId));
    }
  }, [collectionId, nftId]);

  console.log('location', location);

  const handleBackClick = useCallback(() => {
    // TODO this works but leaves trailing slash
    // navigate('..');

    navigate(`/${window.location.pathname.split('/')[1]}`);
  }, []);

  const nextNftId = useMemo(() => {
    // TODO: return id of next nft in collection array
    return '123';
  }, []);

  const prevNftId = useMemo(() => {
    // TODO: return id of next nft in collection array
    return '456';
  }, []);

  if (!nft) {
    // TODO implement loading state - is it needed?
    return <div>loading</div>;
  }

  return (
    <StyledNftDetailPage>
      <StyledBackLink onClick={handleBackClick}>
        <ActionText>← Back to gallery</ActionText>
      </StyledBackLink>
      <StyledBody>
        {/* {prevNftId && (
          <NavigationHandle
            direction={Directions.LEFT}
            nftId={prevNftId}
          ></NavigationHandle>
        )} */}
        <StyledContentContainer>
          <NftDetailAsset nft={nft} />
          <NftDetailLabel nft={nft} />
        </StyledContentContainer>
        {/* {nextNftId && (
          <NavigationHandle
            direction={Directions.RIGHT}
            nftId={nextNftId}
          ></NavigationHandle>
        )} */}
      </StyledBody>
    </StyledNftDetailPage>
  );
}

const StyledBody = styled.div`
  display: flex;
`;

const StyledBackLink = styled.a`
  margin-top: 32px;
  position: absolute;
  z-index: 5;
  display: none;

  @media only screen and ${breakpoints.tablet} {
    display: block;
  }
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;

  margin: 112px auto 0;
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    width: initial;
  }
`;
const StyledNftDetailPage = styled.div`
  display: flex;
  flex-direction: column;

  margin: 0 ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    margin: 0 ${pageGutter.tablet}px;
  }
`;

export default NftDetailPage;
