import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { getPreviewImageUrlsInlineDangerously } from 'shared/relay/getPreviewImageUrlsInlineDangerously';
import { removeNullValues } from 'shared/relay/removeNullValues';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE } from '~/constants/opengraph';
import { fcframeUsernameOpengraphQuery } from '~/generated/fcframeUsernameOpengraphQuery.graphql';

export default function FarcasterOpenGraphUserPage() {
  const { query: urlQuery } = useRouter();
  const { username, position, width, height } = urlQuery;

  const queryResponse = useLazyLoadQuery<fcframeUsernameOpengraphQuery>(
    graphql`
      query fcframeUsernameOpengraphQuery($username: String!) {
        user: userByUsername(username: $username) {
          ... on ErrUserNotFound {
            __typename
          }
          ... on ErrInvalidInput {
            __typename
          }
          ... on GalleryUser {
            __typename
            username
            galleries {
              hidden
              collections {
                hidden
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
        }
      }
    `,
    { username: username as string }
  );

  if (queryResponse.user?.__typename !== 'GalleryUser') {
    throw new Error('invalid user!');
  }

  const { user } = queryResponse;

  const nonEmptyGalleries = user.galleries?.filter(
    (gallery) =>
      !gallery?.hidden && gallery?.collections?.some((collection) => collection?.tokens?.length)
  );

  const tokensToDisplay = useMemo(() => {
    const tokens = removeNullValues(
      nonEmptyGalleries?.[0]?.collections
        ?.filter((collection) => !collection?.hidden)
        .flatMap((collection) => collection?.tokens)
        .map((galleryToken) => {
          const result = galleryToken?.token
            ? getPreviewImageUrlsInlineDangerously({ tokenRef: galleryToken.token })
            : null;

          if (result?.type === 'valid') {
            return {
              src: result.urls.large ?? '',
              name: galleryToken?.token?.definition?.name,
              communityName: galleryToken?.token?.definition?.community?.name,
            };
          }
          return null;
        })
    ).slice(0, 4);

    if (!position) {
      return tokens.slice(0, 2);
    }

    const mainPosition = Number(position as string) % tokens.length;
    if (mainPosition === 0) {
      return [tokens[tokens.length - 1], ...tokens.slice(0, 2)];
    }

    const start = mainPosition - 1;
    const end = mainPosition + 2;
    let result = tokens.slice(start, end);
    if (end > tokens.length) {
      result = [...result, tokens[0]!];
    }
    return result;
  }, [nonEmptyGalleries, position]);

  const displayWidth = parseInt(width as string) || WIDTH_OPENGRAPH_IMAGE;
  const displayHeight = parseInt(height as string) || HEIGHT_OPENGRAPH_IMAGE;

  const shouldHaveLeftToken = tokensToDisplay.length === 3;
  const leftToken = shouldHaveLeftToken ? tokensToDisplay[0] : null;
  const centerToken = tokensToDisplay[shouldHaveLeftToken ? 1 : 0];
  const rightToken = tokensToDisplay[shouldHaveLeftToken ? 2 : 1];

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
