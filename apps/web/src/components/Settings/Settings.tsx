import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import DrawerHeader from '~/contexts/globalLayout/GlobalSidebar/DrawerHeader';
import { SettingsFragment$key } from '~/generated/SettingsFragment.graphql';
import { useLogout } from '~/hooks/useLogout';
import colors from '~/shared/theme/colors';

import ManageAuthSection from './ManageAccountsSection/ManageAccountsSection';
import ManageEmailSection from './ManageEmailSection/ManageEmailSection';
import ManageTwitterSection from './ManageTwitterSection/ManageTwitterSection';
import MembersClubSection from './MembersClubSection/MembersClubSection';
import MobileAuthManagerSection from './MobileAuthManagerSection/MobileAuthManagerSection';

type Props = {
  queryRef: SettingsFragment$key;
};

function Settings({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment SettingsFragment on Query {
        ...ManageEmailSectionFragment
        ...ManageAccountsSectionFragment
        ...ManageTwitterSectionFragment
        ...MembersClubSectionFragment
      }
    `,
    queryRef
  );

  // drop settings param from URL once modal has been opened
  const { pathname, query: urlQuery, replace } = useRouter();
  useEffect(() => {
    const params = new URLSearchParams(urlQuery as Record<string, string>);
    if (params.has('settings')) {
      params.delete('settings');
      // @ts-expect-error we're simply replacing the current page with the same path
      replace({ pathname, query: params.toString() }, undefined, { shallow: true });
    }
  }, [pathname, replace, urlQuery]);

  const logout = useLogout();

  const handleSignOutClick = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <>
      <DrawerHeader headerText="Settings" />
      <StyledContentWrapper>
        <StyledSettings gap={12}>
          <SettingsContents gap={24}>
            <ManageEmailSection queryRef={query} />

            <Divider />

            <ManageTwitterSection queryRef={query} />

            <Divider />

            <ManageAuthSection queryRef={query} />

            <Divider />

            <MobileAuthManagerSection />

            <Divider />

            <MembersClubSection queryRef={query} />

            <Divider />

            <HStack justify="end">
              <StyledButton variant="warning" onClick={handleSignOutClick}>
                Sign Out
              </StyledButton>
            </HStack>
          </SettingsContents>
        </StyledSettings>
      </StyledContentWrapper>
    </>
  );
}

const StyledSettings = styled(VStack)`
  @media only screen and ${breakpoints.tablet} {
    width: 100%;
  }
  margin-bottom: 64px;
`;

const SettingsContents = styled(VStack)`
  padding: 16px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${colors.porcelain};
`;

const StyledButton = styled(Button)`
  padding: 8px 12px;
`;

const StyledContentWrapper = styled.div`
  overflow-y: scroll;
  overflow-x: hidden;
  overscroll-behavior: contain;
  height: 100%;
`;

export default Settings;
