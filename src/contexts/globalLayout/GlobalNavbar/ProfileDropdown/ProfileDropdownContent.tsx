import colors from 'components/core/colors';
import { Paragraph, TITLE_FONT_FAMILY, TitleM } from 'components/core/Text/Text';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import styled from 'styled-components';
import Link from 'next/link';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useAuthActions } from 'contexts/auth/AuthContext';
import useWalletModal from 'hooks/useWalletModal';
import { getEditGalleryUrl } from 'utils/getEditGalleryUrl';
import { route, Route } from 'nextjs-routes';
import { Dropdown } from 'components/core/Dropdown/Dropdown';
import { DropdownLink } from 'components/core/Dropdown/DropdownLink';
import { DropdownSection } from 'components/core/Dropdown/DropdownSection';
import { DropdownItem } from 'components/core/Dropdown/DropdownItem';
import { ProfileDropdownContentFragment$key } from '../../../../../__generated__/ProfileDropdownContentFragment.graphql';
import breakpoints from 'components/core/breakpoints';

type Props = {
  showDropdown: boolean;
  onClose: () => void;
  queryRef: ProfileDropdownContentFragment$key;
};

export function ProfileDropdownContent({ showDropdown, onClose, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment ProfileDropdownContentFragment on Query {
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }

        ...getEditGalleryUrlFragment
      }
    `,
    queryRef
  );

  const showWalletModal = useWalletModal();
  const { handleLogout } = useAuthActions();

  const username = query.viewer?.user?.username;

  if (!username) {
    return null;
  }

  const editGalleryUrl = getEditGalleryUrl(query);

  const userGalleryRoute: Route = { pathname: '/[username]', query: { username } };

  return (
    <>
      <Dropdown position="left" active={showDropdown} onClose={onClose}>
        <DropdownSection>
          <Link href={userGalleryRoute}>
            <DropdownProfileSection href={route(userGalleryRoute)}>
              <UsernameText>{username}</UsernameText>
              {editGalleryUrl && (
                // Need this to ensure the interactive link doesn't take the full width
                <VStack align="flex-start">
                  <StyledInteractiveLink to={editGalleryUrl}>Edit gallery</StyledInteractiveLink>
                </VStack>
              )}
            </DropdownProfileSection>
          </Link>
        </DropdownSection>

        <DropdownSection gap={4}>
          <DropdownLink href={{ pathname: '/home' }}>HOME</DropdownLink>
        </DropdownSection>

        <DropdownSection gap={4}>
          <DropdownItem onClick={showWalletModal}>ACCOUNTS</DropdownItem>
          <DropdownLink href={{ pathname: '/shop' }}>
            <HStack gap={8}>
              <span>SHOP</span>
              <StyledObjectsText>(OBJECTS)</StyledObjectsText>
            </HStack>
          </DropdownLink>
        </DropdownSection>

        <DropdownSection gap={4}>
          <DropdownItem onClick={handleLogout}>LOG OUT</DropdownItem>
        </DropdownSection>
      </Dropdown>
    </>
  );
}

const StyledObjectsText = styled(TitleM)`
  font-family: 'GT Alpina Condensed';
  display: inline;
  height: 16px;
  font-style: normal;
  font-weight: 300;
  font-size: 14.4127px;
  line-height: 16px;
  color: inherit;
`;

const UsernameText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-style: normal;
  font-weight: 400;
  line-height: 21px;
  letter-spacing: -0.04em;

  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;

  font-size: 16px;
  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  font-size: 10px !important;
`;

const DropdownProfileSection = styled.a`
  display: flex;
  flex-direction: column;
  gap: 4px 0;

  text-decoration: none;

  padding: 8px;

  :hover {
    background-color: ${colors.faint};
  }
`;
