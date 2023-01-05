import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { GalleryFragment$key } from '~/generated/GalleryFragment.graphql';

import PencilIcon from '~/icons/PencilIcon';
import { removeNullValues } from '~/utils/removeNullValues';

import colors from '../core/colors';
import { DropdownItem } from '../core/Dropdown/DropdownItem';
import SettingsDropdown from '../core/Dropdown/SettingsDropdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleDiatypeM, TitleXS } from '../core/Text/Text';
import useSetFeaturedGallery from './useSetFeaturedGallery';
import useUpdateGalleryHidden from './useUpdateGalleryHidden';

type Props = {
  isFeatured?: boolean;
  queryRef: GalleryFragment$key;
};

export default function Gallery({ isFeatured = false, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryFragment on Gallery {
        dbid
        id
        name
        tokenPreviews @required(action: THROW)
        hidden @required(action: THROW)
        collections @required(action: THROW) {
          id
        }
      }
    `,
    queryRef
  );

  console.log(query);

  const setFeaturedGallery = useSetFeaturedGallery();
  const updateGalleryHidden = useUpdateGalleryHidden();

  const handleSetFeaturedGallery = useCallback(() => {
    setFeaturedGallery(query.dbid);
  }, [query.dbid, setFeaturedGallery]);

  const handleUpdateGalleryHidden = useCallback(() => {
    updateGalleryHidden(query.dbid, !query.hidden);
  }, [query.dbid, query.hidden, updateGalleryHidden]);

  const handleEditGallery: Route = useMemo(() => {
    return {
      pathname: '/gallery/[galleryId]/edit',
      query: { galleryId: query.dbid },
    };
  }, [query.dbid]);

  const { name, collections, tokenPreviews, hidden } = query;

  const nonNullTokenPreviews = removeNullValues(tokenPreviews) ?? [];

  return (
    <StyledGalleryWrapper gap={12}>
      <StyledGalleryHeader justify="space-between">
        <StyledGalleryTitleWrapper isHidden={hidden}>
          <TitleDiatypeM>{name || 'Untitled'}</TitleDiatypeM>
          <BaseM>{collections.length} collections</BaseM>
        </StyledGalleryTitleWrapper>
        <HStack gap={8} align="center">
          {isFeatured && <StyledGalleryFeaturedText as="span">Featured</StyledGalleryFeaturedText>}
          <Link href={handleEditGallery}>
            <a>
              <PencilIcon />
            </a>
          </Link>
          <SettingsDropdown>
            <DropdownItem>EDIT NAME & DESC</DropdownItem>
            {hidden ? (
              <DropdownItem onClick={handleUpdateGalleryHidden}>UNHIDE</DropdownItem>
            ) : (
              <>
                {!isFeatured && (
                  <DropdownItem onClick={handleSetFeaturedGallery}>FEATURE ON PROFILE</DropdownItem>
                )}
                <DropdownItem onClick={handleUpdateGalleryHidden}>HIDE</DropdownItem>
              </>
            )}
            <DropdownItem>DELETE</DropdownItem>
          </SettingsDropdown>
        </HStack>
      </StyledGalleryHeader>
      <StyledTokenPreviewWrapper isHidden={hidden}>
        {nonNullTokenPreviews.map((token) => (
          <StyledTokenPreview key={token} src={token} alt="token preview" />
        ))}
      </StyledTokenPreviewWrapper>
    </StyledGalleryWrapper>
  );
}

const StyledGalleryWrapper = styled(VStack)`
  padding: 12px;
`;
const StyledGalleryHeader = styled(HStack)``;

const StyledGalleryTitleWrapper = styled(VStack)<{ isHidden?: boolean }>`
  opacity: ${({ isHidden = false }) => (isHidden ? 0.5 : 1)};
`;

const StyledGalleryFeaturedText = styled(TitleXS)`
  border: 1px solid ${colors.activeBlue};
  border-radius: 2px;
  padding: 2px 4px;
  color: ${colors.activeBlue};
  font-weight: 500;
`;

const StyledTokenPreviewWrapper = styled.div<{ isHidden?: boolean }>`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  opacity: ${({ isHidden }) => (isHidden ? 0.5 : 1)};
`;
const StyledTokenPreview = styled.img`
  width: 100%;
`;
