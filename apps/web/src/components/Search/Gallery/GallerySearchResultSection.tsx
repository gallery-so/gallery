import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { GallerySearchResultSectionFragment$key } from '~/generated/GallerySearchResultSectionFragment.graphql';

import colors from '../../core/colors';
import InteractiveLink from '../../core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '../../core/Spacer/Stack';
import { TitleXS } from '../../core/Text/Text';
import { SearchFilterType } from '../Search';
import GallerySearchResult from './GallerySearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  queryRef: GallerySearchResultSectionFragment$key;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export default function GallerySearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
  queryRef,
}: Props) {
  const results = useFragment(
    graphql`
      fragment GallerySearchResultSectionFragment on GallerySearchResult @relay(plural: true) {
        gallery @required(action: THROW) {
          id
          ...GallerySearchResultFragment
        }
      }
    `,
    queryRef
  );

  const resultsToShow = useMemo(
    () => (isShowAll ? results : results?.slice(0, 4) ?? []),
    [results, isShowAll]
  );

  if (resultsToShow.length === 0) return null;

  return (
    <VStack gap={10}>
      <StyledResultHeader align="center" justify="space-between">
        <StyledTitle>{title}</StyledTitle>

        {!isShowAll && (
          <StyledInteractiveLink onClick={() => onChangeFilter('gallery')}>
            Show all
          </StyledInteractiveLink>
        )}
      </StyledResultHeader>

      <VStack>
        {resultsToShow.map((result) => (
          <GallerySearchResult key={result.gallery.id} galleryRef={result.gallery} />
        ))}
      </VStack>
    </VStack>
  );
}

const StyledTitle = styled(TitleXS)`
  text-transform: uppercase;
`;

const StyledResultHeader = styled(HStack)`
  padding: 0 12px;
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  color: ${colors.offBlack};
`;
