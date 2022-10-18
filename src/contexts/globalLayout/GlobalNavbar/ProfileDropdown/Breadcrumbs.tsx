import styled from 'styled-components';
import { BODY_FONT_FAMILY, Paragraph, TITLE_FONT_FAMILY } from 'components/core/Text/Text';
import { HStack } from 'components/core/Spacer/Stack';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { BreadcrumbsUsernameBreadcrumb$key } from '../../../../../__generated__/BreadcrumbsUsernameBreadcrumb.graphql';

export const HomeText = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 18px;
  font-weight: 500;
  line-height: 21px;

  letter-spacing: -0.04em;
`;

export const BreadcrumbText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 18px;
  font-weight: 400;
  line-height: 21px;
`;

type UsernameBreadcrumbProps = {
  queryRef: BreadcrumbsUsernameBreadcrumb$key;
};

export function UsernameBreadcrumb({ queryRef }: UsernameBreadcrumbProps) {
  const query = useFragment(
    graphql`
      fragment BreadcrumbsUsernameBreadcrumb on Query {
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    queryRef
  );

  if (!query.viewer?.user?.username) {
    throw new Error('Tried to render UsernameBreadcrumb without a viewer');
  }

  return (
    <HStack gap={8}>
      <BreadcrumbText>{query.viewer.user.username}</BreadcrumbText>
    </HStack>
  );
}
