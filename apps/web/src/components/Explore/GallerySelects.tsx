import { useMemo } from 'react';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import ArrowUpRightIcon from '~/icons/ArrowUpRightIcon';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';

import breakpoints from '../core/breakpoints';
import GalleryLink from '../core/GalleryLink/GalleryLink';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleDiatypeL, TitleM } from '../core/Text/Text';

function Article({ article }: { article: CmsTypes.ExplorePageGallerySelectsArticle }) {
  return (
    <StyledArticle
      eventElementId="Explore Page Article"
      eventName="Clicked Explore Page Article"
      properties={{ articleTitle: article.title, articleUrl: article.articleUrl }}
      href={article.articleUrl}
      target="_blank"
      rel="noreferrer"
    >
      <StyledArticleContent>
        <StyledArticleImage src={article.coverImage.asset.url} />
        <StyledArticleText justify="space-between" gap={24}>
          <VStack gap={12}>
            <TitleM>
              <strong>{article.title}</strong>
            </TitleM>
            <StyledArticleDescription>{article.previewText}</StyledArticleDescription>
            <ArticleLinkButton>
              <HStack gap={4} align="center" justify="center">
                <BaseM color={colors.white}>View Article</BaseM>
                <ArrowUpRightIcon />
              </HStack>
            </ArticleLinkButton>
          </VStack>
        </StyledArticleText>
      </StyledArticleContent>
    </StyledArticle>
  );
}

const StyledArticle = styled(GalleryLink)`
  width: 100%;
  text-decoration: none;

  @media only screen and ${breakpoints.desktop} {
    max-height: 302px;
  }
`;

const StyledArticleContent = styled(VStack)`
  border-radius: 8px;
  gap: 24px 16px;
  height: 100%;
  box-sizing: content-box;

  @media only screen and ${breakpoints.tablet} {
    background-color: ${colors.offWhite};
    padding: 12px;
    flex-direction: row;
  }
`;

const StyledArticleText = styled(VStack)`
  padding: 8px 0;
`;

const StyledArticleImage = styled.img`
  width: 100%;
  @media only screen and ${breakpoints.tablet} {
    width: 50%;
  }
  ratio: 1;
`;

const StyledArticleDescription = styled(BaseM)`
  color: ${colors.shadow};

  @media only screen and ${breakpoints.tablet} {
    max-height: 180px;
    display: -webkit-box;
    overflow: hidden;

    -webkit-box-orient: vertical;
    line-clamp: 9;
    text-overflow: ellipsis;
    -webkit-line-clamp: 9;
  }
`;

const ArticleLinkButton = styled.div`
  background-color: ${colors.black['800']};
  border-radius: 4px;
  padding: 6px 12px;
  text-decoration: none;
  text-align: center;

  @media only screen and ${breakpoints.tablet} {
    width: fit-content;
  }
`;

type Props = {
  gallerySelectsContent: CmsTypes.ExplorePageGallerySelectsList;
};

export default function GallerySelects({ gallerySelectsContent }: Props) {
  const articlesToShow = useMemo(() => {
    return gallerySelectsContent.articleList.slice(0, 2);
  }, [gallerySelectsContent.articleList]);
  return (
    <StyledTrendingSection gap={12}>
      <VStack gap={4}>
        <Title>Gallery Selects</Title>
        <TitleDiatypeL color={colors.metal}>
          Conversations with artists and collectors
        </TitleDiatypeL>
      </VStack>
      <ArticleContainer>
        {articlesToShow.map((article) => (
          <Article key={article.title} article={article} />
        ))}
      </ArticleContainer>
    </StyledTrendingSection>
  );
}

const StyledTrendingSection = styled(VStack)`
  width: 100%;
`;

const Title = styled(TitleDiatypeL)`
  font-size: 24px;
`;

const ArticleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media only screen and ${breakpoints.desktop} {
    flex-direction: row;
  }
`;
