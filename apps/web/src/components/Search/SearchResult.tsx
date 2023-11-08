import { ReactNode, useMemo } from 'react';
import styled from 'styled-components';

import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { getHighlightedDescription, getHighlightedName } from '~/shared/utils/highlighter';

import GalleryLink from '../core/GalleryLink/GalleryLink';
import Markdown from '../core/Markdown/Markdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { SearchResultVariant } from './types';

type Props = {
  name: string;
  description: string;
  profilePicture?: ReactNode;

  variant?: SearchResultVariant;
  onClick: () => void;
  keyword: string;
};

export default function SearchResult({
  name,
  description,
  keyword,

  profilePicture,
  variant = 'default',
  onClick,
}: Props) {
  const highlightedName = useMemo(() => getHighlightedName(name, keyword), [keyword, name]);

  const highlightedDescription = useMemo(
    () => getHighlightedDescription(description, keyword),
    [keyword, description]
  );

  return (
    <StyledSearchResult className="SearchResult" onClick={onClick} variant={variant}>
      <HStack gap={4} align="center">
        {profilePicture}
        <VStack>
          <StyledText variant={variant}>
            <Markdown text={highlightedName} eventContext={contexts.Search} />
          </StyledText>
          {highlightedDescription && (
            <StyledDescription>
              <StyledText variant={variant}>
                <Markdown text={highlightedDescription} eventContext={contexts.Search} />
              </StyledText>
            </StyledDescription>
          )}
        </VStack>
      </HStack>
    </StyledSearchResult>
  );
}

const StyledSearchResult = styled(GalleryLink)<{
  className: string;
  variant: SearchResultVariant;
}>`
  color: ${colors.black['800']};
  cursor: pointer;
  text-decoration: none;

  &:hover,
  &:focus {
    outline: none;
    background-color: ${colors.faint};
    border-radius: 4px;
  }

  ${(props) =>
    props.variant === 'compact'
      ? 'padding: 8px;'
      : `padding: 16px 12px;
  `}
`;

const StyledDescription = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  -webkit-box-pack: end;

  height: 20px; // ensure consistent height even if description is not present
  p {
    display: inline;
  }
`;

const StyledText = styled(BaseM)<{
  variant: SearchResultVariant;
}>`
  font-size: ${(props) => (props.variant === 'compact' ? '12px' : '14px')};
  line-height: ${(props) => (props.variant === 'compact' ? '16px' : '20px')};
`;
