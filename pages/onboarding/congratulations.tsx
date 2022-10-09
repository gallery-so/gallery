import styled from 'styled-components';
import { BaseM, TitleL } from 'components/core/Text/Text';
import { useLazyLoadQuery } from 'react-relay';
import { ButtonLink } from 'components/core/Button/Button';
import { VStack } from 'components/core/Spacer/Stack';
import { graphql } from 'relay-runtime';
import { congratulationsQuery } from '../../__generated__/congratulationsQuery.graphql';
import FullPageCenteredStep from 'components/Onboarding/FullPageCenteredStep';

export default function Congratulations() {
  const query = useLazyLoadQuery<congratulationsQuery>(
    graphql`
      query congratulationsQuery {
        viewer {
          ... on Viewer {
            __typename

            user {
              username
            }
          }
        }
      }
    `,
    {}
  );

  if (query.viewer?.__typename !== 'Viewer') {
    throw new Error(
      `OrganizeCollection expected Viewer to be type 'Viewer' but got: ${query.viewer?.__typename}`
    );
  }

  const username = query?.viewer?.user?.username;

  return (
    <FullPageCenteredStep>
      <VStack gap={24}>
        <VStack gap={8}>
          <TitleL>Welcome to your Gallery</TitleL>
          <StyledBodyText>Let&apos;s show your collection to the world.</StyledBodyText>
        </VStack>
        <FixedWidthButtonLink href={`/${username}`}>Enter</FixedWidthButtonLink>
      </VStack>
    </FullPageCenteredStep>
  );
}

const StyledBodyText = styled(BaseM)`
  max-width: 400px;
  text-align: center;
`;

const FixedWidthButtonLink = styled(ButtonLink)`
  min-width: 200px;
`;
