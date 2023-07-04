import Link, { LinkProps } from 'next/link';
import { Route, route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { SearchResultQueryFragment$key } from '~/generated/SearchResultQueryFragment.graphql';
import { SearchResultUserFragment$key } from '~/generated/SearchResultUserFragment.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import Markdown from '../core/Markdown/Markdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { SearchFilterType } from './Search';
import { useSearchContext } from './SearchContext';

type Props = {
  name: string;
  description: string;
  path: Route;
  type: SearchFilterType;
  userRef?: SearchResultUserFragment$key | null;
  queryRef: SearchResultQueryFragment$key;
};

const MAX_DESCRIPTION_CHARACTER = 150;

export default function SearchResult({ name, description, path, type, userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment SearchResultUserFragment on GalleryUser {
        __typename
        ...ProfilePictureFragment
      }
    `,
    userRef || null
  );

  const query = useFragment(
    graphql`
      fragment SearchResultQueryFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const isPfpEnabled = isFeatureEnabled(FeatureFlag.PFP, query);

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
    const regex = new RegExp(keyword, 'gi');

    // Remove bold & link markdown tag from description
    const unformattedDescription = description.replace(/\*\*/g, '').replace(/\[.*\]\(.*\)/g, '');

    const matchIndex = unformattedDescription.search(regex);
    let truncatedDescription;

    const maxLength = MAX_DESCRIPTION_CHARACTER;

    if (matchIndex > -1 && matchIndex + keyword.length === unformattedDescription.length) {
      const endIndex = Math.min(unformattedDescription.length, maxLength);
      truncatedDescription = `...${unformattedDescription.substring(
        endIndex - maxLength,
        endIndex
      )}`;
    } else {
      truncatedDescription = unformattedDescription.substring(0, maxLength);
    }
    // highlight keyword
    return truncatedDescription.replace(regex, (match) => `**${match}**`);
  }, [keyword, description]);

  return (
    <StyledSearchResult className="SearchResult" href={path} onClick={handleClick}>
      <HStack gap={4} align="center">
        {user && isPfpEnabled && (
          <div>
            <ProfilePicture size="md" userRef={user} />
          </div>
        )}
        <VStack>
          <BaseM>
            <Markdown text={highlightedName} />
          </BaseM>
          {highlightedDescription && (
            <StyledDescription>
              <BaseM>
                <Markdown text={highlightedDescription} />
              </BaseM>
            </StyledDescription>
          )}
        </VStack>
      </HStack>
    </StyledSearchResult>
  );
}

const StyledSearchResult = styled(Link)<LinkProps & { className: string }>`
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
