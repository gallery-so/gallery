import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE } from '~/constants/opengraph';
import { fcframeCollectionIdOpengraphQuery } from '~/generated/fcframeCollectionIdOpengraphQuery.graphql';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export default function OpenGraphCollectionPage() {
  const { query: urlQuery } = useRouter();
  const { collectionId, position, width, height } = urlQuery;

  const queryResponse = useLazyLoadQuery<fcframeCollectionIdOpengraphQuery>(
    graphql`
      query fcframeCollectionIdOpengraphQuery($collectionId: DBID!) {
        collection: collectionById(id: $collectionId) {
          ... on ErrCollectionNotFound {
            __typename
          }
          ... on Collection {
            __typename

            tokens {
              token {
                ...getPreviewImageUrlsInlineDangerouslyFragment
                definition {
                  name
                  community {
                    name
                  }
                }
              }
            }
          }
        }
      }
    `,
    { collectionId: collectionId as string }
  );

  if (queryResponse.collection?.__typename !== 'Collection') {
    throw new Error('invalid collection ID!');
  }

  const { collection } = queryResponse;

  const tokensToDisplay = useMemo(() => {
    const tokens = removeNullValues(
      removeNullValues(collection.tokens).map(({ token }) => {
        if (token) {
          const result = getPreviewImageUrlsInlineDangerously({ tokenRef: token });
          if (result.type === 'valid') {
            return {
              src: result.urls.large,
              name: token.definition.name,
              communityName: token.definition.community?.name,
            };
          }
          return null;
        }
      })
    );

    if (!position) {
      return tokens.slice(0, 2);
    }

    const mainPosition = Number(position as string) % tokens.length;
    if (mainPosition === 0) {
      return [tokens[tokens.length - 1], ...tokens.slice(0, 2)];
    }
    return tokens.slice(mainPosition - 1, mainPosition + 2);
  }, [collection.tokens, position]);

  const displayWidth = parseInt(width as string) || WIDTH_OPENGRAPH_IMAGE;
  const displayHeight = parseInt(height as string) || HEIGHT_OPENGRAPH_IMAGE;

  console.log(tokensToDisplay);

  const shouldHaveLeftToken = tokensToDisplay.length === 3;
  const leftToken = shouldHaveLeftToken ? tokensToDisplay[0] : null;
  const centerToken = tokensToDisplay[shouldHaveLeftToken ? 1 : 0];
  const rightToken = tokensToDisplay[shouldHaveLeftToken ? 2 : 1];

  console.log({ leftToken, centerToken, rightToken });

  return (
    <>
      <div className="page">
        <div id="opengraph-image" style={{ width: displayWidth, height: displayHeight }}>
          <StyledContainer>
            <ContainerImageLeft>
              {leftToken ? (
                <VStack gap={8}>
                  <StyledImage key={leftToken?.src} src={leftToken?.src ?? ''} />
                  <VStack>
                    <BaseM>{leftToken?.name}</BaseM>
                    <TitleDiatypeM>{leftToken?.communityName}</TitleDiatypeM>
                  </VStack>
                </VStack>
              ) : null}
            </ContainerImageLeft>
            <ContainerCenter>
              <VStack gap={8}>
                <StyledImage key={centerToken?.src} src={centerToken?.src ?? ''} />
                <VStack>
                  <BaseM>{centerToken?.name}</BaseM>
                  <TitleDiatypeM>{centerToken?.communityName}</TitleDiatypeM>
                </VStack>
              </VStack>
            </ContainerCenter>
            <ContainerImageRight>
              <VStack gap={8}>
                <StyledImage key={rightToken?.src} src={rightToken?.src ?? ''} />
                <VStack>
                  <BaseM>{rightToken?.name}</BaseM>
                  <TitleDiatypeM>{rightToken?.communityName}</TitleDiatypeM>
                </VStack>
              </VStack>
            </ContainerImageRight>
          </StyledContainer>
        </div>
      </div>
      <style>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e7e5e4;
        }
        #opengraph-image {
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
        }
      `}</style>
    </>
  );
}

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  background-color: #ffffff;
  position: relative;

  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ContainerImageLeft = styled.div`
  margin-left: -25%;
  filter: blur(6px);
  opacity: 0.26;
`;

const ContainerImageRight = styled.div`
  margin-right: -25%;
  filter: blur(6px);
  opacity: 0.26;
`;

const ContainerCenter = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const StyledImage = styled.img`
  max-width: 100%;
  width: auto;
  height: 500px;
`;
