import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import PencilIcon from '~/icons/PencilIcon';

import colors from '../core/colors';
import { DropdownItem } from '../core/Dropdown/DropdownItem';
import SettingsDropdown from '../core/Dropdown/SettingsDropdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleDiatypeM, TitleXS } from '../core/Text/Text';
import useSetFeaturedGallery from './useSetFeaturedGallery';
import useUpdateGalleryHidden from './useUpdateGalleryHidden';

type Props = {
  isFeatured?: boolean;
  queryRef: any;
};

export default function Gallery({ isFeatured = false, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryFragment on Gallery {
        dbid
        id
        name
        description
        tokenPreviews
        position
        hidden
        collections {
          id
        }
      }
    `,
    queryRef
  );

  const setFeaturedGallery = useSetFeaturedGallery();
  const updateGalleryHidden = useUpdateGalleryHidden();

  const handleSetFeaturedGallery = useCallback(() => {
    setFeaturedGallery(query.dbid);
  }, [query.dbid, setFeaturedGallery]);

  const handleUpdateGalleryHidden = useCallback(() => {
    updateGalleryHidden(query.dbid, !query.hidden);
  }, [query.id, query.dbid, query.hidden, updateGalleryHidden]);

  const { name, collections, tokenPreviews, hidden } = query;

  return (
    <StyledGalleryWrapper gap={12}>
      <StyledGalleryHeader justify="space-between">
        <StyledGalleryTitleWrapper isHidden={hidden}>
          <TitleDiatypeM>{name || 'Untitled'}</TitleDiatypeM>
          <BaseM>{collections.length} collections</BaseM>
        </StyledGalleryTitleWrapper>
        <HStack gap={8} align="center">
          {isFeatured && <StyledGalleryFeaturedText as="span">Featured</StyledGalleryFeaturedText>}
          <PencilIcon />
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
        {tokenPreviews.map((token: string) => (
          <StyledTokenPreview key={token} src={token} alt="token preview" />
        ))}
      </StyledTokenPreviewWrapper>
    </StyledGalleryWrapper>
  );
}

const StyledGalleryWrapper = styled(VStack)`
  /* width: 308px; */
  padding: 12px;
  /* background-color: red; */
`;
const StyledGalleryHeader = styled(HStack)``;

const StyledGalleryTitleWrapper = styled(VStack)<{ isHidden?: boolean }>`
  opacity: ${({ isHidden }) => (isHidden ? 0.5 : 1)};
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
