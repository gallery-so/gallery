import { Route, route } from 'nextjs-routes';
import { ReactNode, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';
import { getHighlightedDescription, getHighlightedName } from '~/shared/utils/highlighter';

import GalleryLink from '../core/GalleryLink/GalleryLink';
import Markdown from '../core/Markdown/Markdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { SearchFilterType } from './Search';
import { useSearchContext } from './SearchContext';

type Props = {
  name: string;
  description: string;
  path: Route;
  type: SearchFilterType;
  profilePicture?: ReactNode;
};

export default function SearchResult({
  name,
  description,
  path,
  type,

  profilePicture,
}: Props) {
  const { hideDrawer } = useDrawerActions();
  const { keyword } = useSearchContext();

  const track = useTrack();

  const handleClick = useCallback(() => {
    hideDrawer();

    const fullLink = route(path);

    track('Search result click', {
      searchQuery: keyword,
      pathname: fullLink,
      resultType: type,
      context: contexts.Search,
    });
  }, [hideDrawer, keyword, path, track, type]);

  const highlightedName = useMemo(() => getHighlightedName(name, keyword), [keyword, name]);

  const highlightedDescription = useMemo(
    () => getHighlightedDescription(description, keyword),
    [keyword, description]
  );

  return (
    <StyledSearchResult className="SearchResult" to={path} onClick={handleClick}>
      <HStack gap={4} align="center">
        {profilePicture}
        <VStack>
          <BaseM>
            <Markdown text={highlightedName} eventContext={contexts.Search} />
          </BaseM>
          {highlightedDescription && (
            <StyledDescription>
              <BaseM>
                <Markdown text={highlightedDescription} eventContext={contexts.Search} />
              </BaseM>
            </StyledDescription>
          )}
        </VStack>
      </HStack>
    </StyledSearchResult>
  );
}

const StyledSearchResult = styled(GalleryLink)<{ className: string }>`
  color: ${colors.black['800']};
  padding: 16px 12px;
  cursor: pointer;
  text-decoration: none;

  &:hover,
  &:focus {
    outline: none;
    background-color: ${colors.faint};
    border-radius: 4px;
  }
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
