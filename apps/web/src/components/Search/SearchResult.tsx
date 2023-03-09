import Link, { LinkProps } from 'next/link';
import { Route, route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';

import colors from '../core/colors';
import Markdown from '../core/Markdown/Markdown';
import { BaseM } from '../core/Text/Text';
import { SearchFilterType } from './Search';
import { useSearchContext } from './SearchContext';

type Props = {
  name: string;
  description: string;
  path: Route;
  type: SearchFilterType;
};

export default function SearchResult({ name, description, path, type }: Props) {
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
    });
  }, [hideDrawer, keyword, path, track, type]);

  const highlightedName = useMemo(() => {
    return name.replace(new RegExp(keyword, 'gi'), (match) => `**${match}**`);
  }, [keyword, name]);

  const highlightedDescription = useMemo(() => {
    return description.replace(new RegExp(keyword, 'gi'), (match) => `**${match}**`);
  }, [keyword, description]);

  return (
    <StyledSearchResult href={path} onClick={handleClick}>
      <BaseM>
        <Markdown text={highlightedName} />
      </BaseM>
      <StyledDescription>
        <BaseM>
          <Markdown text={highlightedDescription} />
        </BaseM>
      </StyledDescription>
    </StyledSearchResult>
  );
}

const StyledSearchResult = styled(Link)<LinkProps>`
  color: ${colors.offBlack};
  padding: 16px 12px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background-color: ${colors.faint};
    border-radius: 4px;
  }
`;

const StyledDescription = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  -webkit-box-pack: end;
  p {
    display: inline;
  }
`;
