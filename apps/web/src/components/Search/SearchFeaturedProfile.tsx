import { useCallback,useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { keyframes } from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { SearchFeaturedProfileFragment$key } from '~/generated/SearchFeaturedProfileFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import unescape from '~/shared/utils/unescape';

import { CmsTypes } from '../../scenes/ContentPages/cms_types';
import { SearchItemType } from './types';

type SearchFeaturedProfileProps = {
  profile: CmsTypes.FeaturedProfile;
  onSelect: (item: SearchItemType) => void;
};

export default function SearchFeaturedProfile({ profile, onSelect }: SearchFeaturedProfileProps) {
  const unescapedBio = useMemo(() => (profile.bio ? unescape(profile.bio) : ''), [profile.bio]);

  const bioFirstLine = useMemo(() => {
    if (!unescapedBio) {
      return '';
    }
    return unescapedBio.split('\n')[0] ?? '';
  }, [unescapedBio]);

  const route = useMemo(() => {
    return {
      type: 'User' as const,
      label: profile.username ?? '',
      value: profile.id,
    };
  }, [profile.username, profile.id]);

  const handleClick = useCallback(() => {
    onSelect(route);
  }, [onSelect, route]);

  return (
    <StyledProfile gap={16} onClick={handleClick}>
      <TokenPreviewContainer>
        {profile.coverImages.map((image) => (
          <StyledImageContainer key={image.asset.url}>
            <StyledImage key={image.asset.url} src={image.asset.url} />
          </StyledImageContainer>
        ))}
      </TokenPreviewContainer>
      <VStack gap={4}>
        <HStack gap={4} align="center" justify="space-between">
          <HStack gap={6} align="center">
            <StyledPfp src={profile.pfp?.asset.url} />
            <Username>
              <strong>{profile.username}</strong>
            </Username>
          </HStack>
        </HStack>

        <StyledUserBio>
          <Markdown text={bioFirstLine} eventContext={contexts.Explore} />
        </StyledUserBio>
      </VStack>
    </StyledProfile>
  );
}

const fadeIn = keyframes`
    from { opacity: 0 };
    to { opacity: 0.96 };
`;

const StyledLinkWrapper = styled(GalleryLink)`
  width: 100%;
`;

export const TokenPreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  min-height: 97px;
  grid-gap: 2px;
`;

const StyledProfile = styled(VStack)`
  border-radius: 4px;
  background-color: ${colors.offWhite};
  padding: 8px;
  cursor: pointer;
  text-decoration: none;
  overflow: hidden;

  animation: ${fadeIn} 0.2s ease-out forwards;

  &:hover {
    background-color: ${colors.faint};
  }

  @media only screen and ${breakpoints.desktop} {
    min-width: 200px;
  }
`;

const StyledPfp = styled.img`
  height: 20px;
  width: 20px;
  border-radius: 50%;
`;

const StyledImageContainer = styled.div`
  display: flex;
  width: 100%;
`;

const Username = styled(BaseM)`
  font-size: 16px;
  font-weight: 700;

  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledUserBio = styled(BaseM)`
  height: 20px; // ensure consistent height even if bio is not present

  font-size: 14px;
  font-weight: 400;
  line-clamp: 1;
  overflow: hidden;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;
