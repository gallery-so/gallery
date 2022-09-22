import styled from 'styled-components';
import { BaseM, TitleL } from 'components/core/Text/Text';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import { usePreloadedQuery } from 'react-relay';
import { useWizardState } from 'contexts/wizard/WizardDataProvider';
import { organizeCollectionQuery } from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';
import { ButtonLink } from 'components/core/Button/Button';
import { VStack } from 'components/core/Spacer/Stack';

function Congratulations() {
  const { queryRef } = useWizardState();

  if (!queryRef) {
    throw new Error('Congratulations.tsx could not access queryRef');
  }

  const query = usePreloadedQuery(organizeCollectionQuery, queryRef);

  if (query.viewer.__typename !== 'Viewer') {
    throw new Error(
      `OrganizeCollection expected Viewer to be type 'Viewer' but got: ${query.viewer.__typename}`
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

export default Congratulations;
