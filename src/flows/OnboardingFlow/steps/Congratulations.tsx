import { useCallback } from 'react';
import styled from 'styled-components';
import { BaseM, TitleL } from 'components/core/Text/Text';
import Button from 'components/core/Button/DeprecatedButton';
import Spacer from 'components/core/Spacer/Spacer';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import { useRouter } from 'next/router';
import { usePreloadedQuery } from 'react-relay';
import { useWizardState } from 'contexts/wizard/WizardDataProvider';
import { organizeCollectionQuery } from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';

function Congratulations() {
  const { queryRef } = useWizardState();
  const { push } = useRouter();

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

  const handleClick = useCallback(() => {
    void push(`/${username}`);
  }, [username, push]);

  return (
    <FullPageCenteredStep>
      <TitleL>Welcome to your Gallery</TitleL>
      <Spacer height={8} />
      <StyledBodyText>Let&apos;s show your collection to the world.</StyledBodyText>
      <Spacer height={24} />
      <StyledButton text="Enter" onClick={handleClick} />
    </FullPageCenteredStep>
  );
}

const StyledBodyText = styled(BaseM)`
  max-width: 400px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  padding: 0px 24px;
  width: 200px;
`;

export default Congratulations;
