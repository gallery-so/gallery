import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useMemo, useCallback } from 'react';
import styled from 'styled-components';

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
  const { hideModal } = useModalActions();
  const rowContent = useMemo(() => {
    return (
      <StyledHStack justify="space-between" align="center" gap={8}>
        {imageContent && <VStack>{imageContent}</VStack>}
        <StyledVStack justify="center">
          <TitleDiatypeM>{title}</TitleDiatypeM>
          {subTitle && (
            <StyledUserBio>
              <Markdown text={subTitle} />
            </StyledUserBio>
          )}
        </StyledVStack>
      </StyledHStack>
    );
  }, [imageContent, subTitle, title]);

  const onPressUserRow = useCallback(() => hideModal(), [hideModal]);

  if (href === null) {
    return <StyledRowNonLink onClick={onPressUserRow}>{rowContent}</StyledRowNonLink>;
  }

  return <StyledRowLink onClick={onPressUserRow} href={href}>{rowContent}</StyledRowLink>;
}

const StyledRowNonLink = styled.div`
  padding: 8px 12px;
  &:hover {
    background: ${colors.offWhite};
  }
`;

const StyledRowLink = styled(Link)`
  padding: 8px 12px;
  text-decoration: none;
  max-height: 56px;
  display: block;

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
