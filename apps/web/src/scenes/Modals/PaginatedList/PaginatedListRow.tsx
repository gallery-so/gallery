import Link from 'next/link';
import { Route } from 'nextjs-routes';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';

type Props = {
  title?: string;
  subTitle?: string;
  href: Route;
};

export default function PaginatedListRow({ title, subTitle, href }: Props) {
  return (
    <StyledRow href={href}>
      <StyledHStack justify="space-between" align="center" gap={8}>
        <StyledVStack justify="center">
          <TitleDiatypeM>{title}</TitleDiatypeM>
          <StyledUserBio>{subTitle && <Markdown text={subTitle} />}</StyledUserBio>
        </StyledVStack>
      </StyledHStack>
    </StyledRow>
  );
}

const StyledRow = styled(Link)`
  padding: 8px 12px;
  text-decoration: none;
  min-height: 56px;
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
