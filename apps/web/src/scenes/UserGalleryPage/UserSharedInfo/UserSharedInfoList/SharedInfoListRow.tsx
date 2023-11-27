import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import colors from '~/shared/theme/colors';

type Props = {
  title?: string;
  subTitle?: string;
  href: Route | null;

  imageContent?: React.ReactNode;
};

export default function SharedInfoListRow({ title, subTitle, href, imageContent }: Props) {
  const rowContent = useMemo(() => {
    return (
      <StyledHStack justify="space-between" align="center" gap={8}>
        {imageContent && <VStack>{imageContent}</VStack>}
        <StyledVStack justify="center">
          <TitleDiatypeM>{title}</TitleDiatypeM>
          {subTitle && (
            <StyledUserBio>
              <Markdown
                text={subTitle}
                // TODO: analytics should get prop drilled
                eventContext={null}
              />
            </StyledUserBio>
          )}
        </StyledVStack>
      </StyledHStack>
    );
  }, [imageContent, subTitle, title]);

  const { hideModal } = useModalActions();
  const handlePressUserLink = useCallback(() => hideModal(), [hideModal]);

  if (href === null) {
    return <StyledRowNonLink>{rowContent}</StyledRowNonLink>;
  }

  return (
    <StyledRowLink
      onClick={handlePressUserLink}
      to={href}
      // TODO analytics - this will be variable by user or community
      eventElementId={null}
      eventName={null}
      eventContext={null}
    >
      {rowContent}
    </StyledRowLink>
  );
}

const StyledRowNonLink = styled.div`
  &:hover {
    background: ${colors.offWhite};
  }
`;

const StyledRowLink = styled(GalleryLink)`
  padding: 8px 12px;
  text-decoration: none;
  max-height: 56px;
  display: block;
  width: 100%;

  &:hover {
    background: ${colors.offWhite};
  }
`;

const StyledHStack = styled(HStack)`
  height: 100%;
`;

const StyledVStack = styled(VStack)`
  width: 100%;
`;

const StyledUserBio = styled(BaseM)`
  height: 20px; // ensure consistent height even if bio is not present
  line-clamp: 1;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
