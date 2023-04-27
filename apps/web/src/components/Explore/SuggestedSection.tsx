import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { SuggestedSectionQueryFragment$key } from '~/generated/SuggestedSectionQueryFragment.graphql';
import colors from '~/shared/theme/colors';

import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleDiatypeL } from '../core/Text/Text';
import ExploreList from './ExploreList';
import ExplorePopoverList from './ExplorePopoverList';

type Props = {
  title: string;
  subTitle: string;
  queryRef: SuggestedSectionQueryFragment$key;
};

export default function SuggestedSection({ queryRef, title, subTitle }: Props) {
  const query = useFragment(
    graphql`
      fragment SuggestedSectionQueryFragment on Query {
        viewer @required(action: THROW) {
          ... on Viewer {
            suggestedUsers(first: 24)
              @connection(key: "ExploreFragment_suggestedUsers")
              @required(action: THROW) {
              edges {
                node {
                  __typename
                  ... on GalleryUser {
                    __typename

                    ...ExploreListFragment
                    ...ExplorePopoverListFragment
                  }
                }
              }
            }
          }
        }
        ...ExploreListQueryFragment
        ...ExplorePopoverListQueryFragment
      }
    `,
    queryRef
  );

  // map edge nodes to an array of GalleryUsers
  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of query.viewer.suggestedUsers?.edges ?? []) {
      if (edge?.node) {
        users.push(edge.node);
      }
    }

    return users;
  }, [query.viewer.suggestedUsers?.edges]);

  const { showModal } = useModalActions();

  const handleSeeAllClick = useCallback(() => {
    showModal({
      content: <ExplorePopoverList exploreUsersRef={nonNullUsers} queryRef={query} />,
      isFullPage: false,
      isPaddingDisabled: true,
    });
  }, [nonNullUsers, query, showModal]);

  return (
    <StyledSuggestedSection gap={32}>
      <HStack justify="space-between" align="center">
        <VStack gap={4}>
          <Title>{title}</Title>
          <TitleDiatypeL color={colors.metal}>{subTitle}</TitleDiatypeL>
        </VStack>

        <StyledInteractiveLink onClick={handleSeeAllClick}>See all</StyledInteractiveLink>
      </HStack>
      <ExploreList exploreUsersRef={nonNullUsers} queryRef={query} />
    </StyledSuggestedSection>
  );
}

const StyledSuggestedSection = styled(VStack)`
  width: 100%;
`;

const Title = styled(TitleDiatypeL)`
  font-size: 24px;
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  white-space: nowrap;
`;
