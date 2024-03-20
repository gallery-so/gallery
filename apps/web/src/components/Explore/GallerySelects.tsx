import colors from 'shared/theme/colors';
import styled from 'styled-components';

import ArrowUpRightIcon from '~/icons/ArrowUpRightIcon';

import breakpoints from '../core/breakpoints';
import GalleryLink from '../core/GalleryLink/GalleryLink';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleDiatypeL, TitleM } from '../core/Text/Text';

const ELLE_ARTICLE_URL = 'https://gallery.mirror.xyz/bcWLpLKxVVJCOvzRHY7F-XAD5PO-3T-Ahc9pZzAhX6k';
function Article() {
  return (
    <StyledArticle
      eventElementId="Explore Page Article"
      eventName="Clicked Explore Page Article"
      href={ELLE_ARTICLE_URL}
      target="_blank"
      rel="noreferrer"
    >
      <StyledArticleContent>
        <StyledArticleImage src="https://images.mirror-media.xyz/publication-images/BIYb97ZD_2ZiEm5UcQUJn.png?height=2284&width=4568" />
        <StyledArticleText justify="space-between" gap={24}>
          <VStack gap={12}>
            <TitleM>
              <strong>Elle's Ode to Internet Subcultures </strong>
            </TitleM>
            <StyledArticleDescription>
              Elle’s on-chain creative journey began in 2021 when she started minting NFTs on the
              Fantom network. She combines her interest in alternative/niche, net-native currency
              and cypherpunk principles with her multiple creative skills. Her work, characterized
              by pixel art and a very specific color palette, reflects her thoughtful engagement
              with many of the web subcultures facets. In this chat, she shares about her
              background, her experiences on Gallery, and how such a move can emphasize the value of
              on-chain art. ⌒ ﾟ( -⩊- )ﾟ⌒
            </StyledArticleDescription>
          </VStack>
          <ArticleLinkButton>
            <HStack gap={4} align="center" justify="center">
              <BaseM color={colors.white}>View Article</BaseM>
              <ArrowUpRightIcon />
            </HStack>
          </ArticleLinkButton>
        </StyledArticleText>
      </StyledArticleContent>
    </StyledArticle>
  );
}

const StyledArticle = styled(GalleryLink)`
  width: 100%;
  text-decoration: none;
`;

const StyledArticleContent = styled(VStack)`
  border-radius: 8px;
  gap: 24px 16px;

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
`;

const StyledArticleDescription = styled(BaseM)`
  color: ${colors.shadow};
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

export default function GallerySelects() {
  return (
    <StyledTrendingSection gap={12}>
      <VStack gap={4}>
        <Title>Gallery Selects</Title>
        <TitleDiatypeL color={colors.metal}>
          Conversations with artists and collectors
        </TitleDiatypeL>
      </VStack>
      <Article />
    </StyledTrendingSection>
  );
}

const StyledTrendingSection = styled(VStack)`
  width: 100%;
`;

const Title = styled(TitleDiatypeL)`
  font-size: 24px;
`;
