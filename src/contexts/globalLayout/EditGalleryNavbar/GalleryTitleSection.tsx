import styled from 'styled-components';

import colors from '~/components/core/colors';
import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { MainGalleryText } from '~/contexts/globalLayout/EditGalleryNavbar/OnboardingEditGalleryNavbar';
import { EditPencilIcon } from '~/icons/EditPencilIcon';

type GalleryTitleSectionProps = {
  onEdit: () => void;
  galleryName: string;
};

export function GalleryTitleSection({ onEdit, galleryName }: GalleryTitleSectionProps) {
  return (
    <GalleryTitleContainer align="center" onClick={onEdit} gap={8}>
      <MainGalleryText>{galleryName || 'Untitled'}</MainGalleryText>

      <EditIconContainer>
        <IconContainer size="sm" variant="stacked" icon={<EditPencilIcon />} />
      </EditIconContainer>
    </GalleryTitleContainer>
  );
}

const EditIconContainer = styled.div`
  opacity: 0;

  transition: opacity 150ms ease-in-out;
`;

const GalleryTitleContainer = styled(HStack)`
  padding: 4px 8px;
  cursor: pointer;

  :hover {
    background-color: ${colors.faint};

    ${EditIconContainer} {
      opacity: 1;
    }
  }
`;
