import { navigate, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import { Text } from 'components/core/Text/Text';
import { Nft } from 'types/Nft';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import breakpoints from 'components/core/breakpoints';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ActionText from 'components/core/ActionText/ActionText';
import NavigationHandle, { Directions } from './NavigationHandle';
import { mockSingleNft } from 'mocks/nfts';
import { mockSingleCollection } from 'mocks/collections';
import { Collection } from 'types/Collection';
import NftDetailLabel from './NftDetailLabel';
// import NftDetailAsset from './NftDetailAsset';

type Params = {
  collectionId: string;
  nftId: string;
};

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

    setNft(mockSingleNft());
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
        {prevNftId && (
          <NavigationHandle
            direction={Directions.LEFT}
            nftId={prevNftId}
          ></NavigationHandle>
        )}
        <StyledContentContainer>
          {/* <NftDetailAsset></NftDetailAsset> */}
          <StyledImageContainer>
            <StyledImage src={nft.imageUrl}></StyledImage>
          </StyledImageContainer>
          <NftDetailLabel nft={nft} />
        </StyledContentContainer>
        {nextNftId && (
          <NavigationHandle
            direction={Directions.RIGHT}
            nftId={nextNftId}
          ></NavigationHandle>
        )}
      </StyledBody>
    </StyledNftDetailPage>
  );
}

const StyledBody = styled.div`
  display: flex;
`;

const StyledBackLink = styled.a`
  margin-left: 32px;
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 32px;
  margin: 64px auto 0;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }
`;
const StyledNftDetailPage = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 32px;
`;

const StyledImageContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledImage = styled.img`
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    width: 600px;
  }
`;

export default NftDetailPage;
