import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import styled from 'styled-components';

import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import colors from '~/shared/theme/colors';

type Props = {
  title?: string;
  subTitle?: string;
  href: Route | null;
};

export default function SharedInfoListRow({ title, subTitle, href }: Props) {
  const rowContent = useMemo(() => {
    return (
      <StyledHStack justify="space-between" align="center" gap={8}>
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
  }, [subTitle, title]);

  if (href === null) {
    return <StyledRowNonLink>{rowContent}</StyledRowNonLink>;
  }

  return <StyledRowLink href={href}>{rowContent}</StyledRowLink>;
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
