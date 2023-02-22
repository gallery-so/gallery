import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import IconContainer from '~/components/core/IconContainer';
import { VStack } from '~/components/core/Spacer/Stack';
import { StandardSidebarFragment$key } from '~/generated/StandardSidebarFragment.graphql';
import CogIcon from '~/icons/CogIcon';
import UserIcon from '~/icons/UserIcon';
import SettingsModal from '~/scenes/Modals/SettingsModal/SettingsModal';

import { useDrawerActions } from './SidebarDrawerContext';

type Props = {
  queryRef: StandardSidebarFragment$key;
};

export function StandardSidebar({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment StandardSidebarFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }
        ...SettingsModalFragment
      }
    `,
    queryRef
  );

  const { showDrawer } = useDrawerActions();

  const isLoggedIn = query.viewer?.__typename === 'Viewer';
  const handleButtonClick = useCallback(() => {
    console.log('open');
    showDrawer(<div>YEEET</div>);
  }, [showDrawer]);
  // const track = useTrack();

  const handleSettingsClick = useCallback(() => {
    // track('click', 'settings', 'sidebar');
    showDrawer({
      content: <SettingsModal queryRef={query} />,
      headerText: 'Settings',
    });
  }, [query, showDrawer]);

  return (
    <StyledStandardSidebar>
      <VStack align="center">
        {/* SIDEBAR */}
        {/* <Button onClick={handleButtonClick}> Open</Button> */}
        <VStack gap={32}>
          <IconContainer variant="default" onClick={handleSettingsClick} icon={<UserIcon />} />
          <IconContainer variant="default" onClick={handleSettingsClick} icon={<CogIcon />} />
        </VStack>
      </VStack>
    </StyledStandardSidebar>
  );
}

const StyledStandardSidebar = styled.div`
  padding-top: 100px; // remove later
  min-width: 100%;
`;

const Icon = styled.img`
  width: 16px;
  height: 16px;
`;
