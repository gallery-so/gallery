import styled from 'styled-components';
import { BaseM, TitleL } from 'components/core/Text/Text';
import DeprecatedSpacer from 'components/core/Spacer/DeprecatedSpacer';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import { usePreloadedQuery } from 'react-relay';
import { useWizardState } from 'contexts/wizard/WizardDataProvider';
import { organizeCollectionQuery } from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';
import { ButtonLink } from 'components/core/Button/Button';

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
      <TitleL>Welcome to your Gallery</TitleL>
      <DeprecatedSpacer height={8} />
      <StyledBodyText>Let&apos;s show your collection to the world.</StyledBodyText>
      <DeprecatedSpacer height={24} />
      <FixedWidthButtonLink href={`/${username}`}>Enter</FixedWidthButtonLink>
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
