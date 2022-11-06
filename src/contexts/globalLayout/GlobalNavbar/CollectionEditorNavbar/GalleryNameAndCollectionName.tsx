import Link from 'next/link';
import { Route, route } from 'nextjs-routes';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY, Paragraph } from '~/components/core/Text/Text';
import {
  EditingText,
  MainGalleryText,
} from '~/contexts/globalLayout/GlobalNavbar/GalleryEditNavbar/GalleryEditNavbar';

type Props = {
  editGalleryRoute: Route;
  galleryName: string;
  collectionName: string;
  rightText: string;
};

export function GalleryNameAndCollectionName({
  galleryName,
  collectionName,
  rightText,
  editGalleryRoute,
}: Props) {
  return (
    <HStack gap={8} align="baseline">
      <Link href={editGalleryRoute}>
        <LinkWrapper href={route(editGalleryRoute)}>
          <StyledMainGalleryText>{galleryName}</StyledMainGalleryText>
        </LinkWrapper>
      </Link>

      <CollectionName>/</CollectionName>

      <CollectionName>{collectionName}</CollectionName>

      <EditingText>{rightText}</EditingText>
    </HStack>
  );
}

const LinkWrapper = styled.a`
  text-decoration: none;
`;

const StyledMainGalleryText = styled(MainGalleryText)`
  color: ${colors.metal};
`;

const CollectionName = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-style: normal;
  font-weight: 500;
  line-height: 21px;
  letter-spacing: -0.04em;
  
  white-space: nowrap;
  
  color ${colors.offBlack}

  font-size: 16px;
  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }
`;
