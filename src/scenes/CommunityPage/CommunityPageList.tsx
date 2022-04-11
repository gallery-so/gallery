import breakpoints from 'components/core/breakpoints';
import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { BaseXL } from 'components/core/Text/Text';
import {
  useMemberListPageActions,
  useMemberListPageState,
} from 'contexts/memberListPage/MemberListPageContext';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Owner } from 'types/Community';
import { removeNullValues } from 'utils/removeNullValues';

type CommunityPageUserProps = {
  username: string;
  address: string;
};

function CommunityPageUser({ username, address }: CommunityPageUserProps) {
  const { setFadeUsernames } = useMemberListPageActions();
  const { fadeUsernames } = useMemberListPageState();
  const onMouseEnter = useCallback(() => {
    setFadeUsernames(true);
  }, [setFadeUsernames]);

  const onMouseLeave = useCallback(() => {
    setFadeUsernames(false);
  }, [setFadeUsernames]);

  return (
    <StyledOwner>
      <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <StyledLink key={address} href={`/${username}`} fadeUsernames={fadeUsernames}>
          <StyledBaseXL>{username}</StyledBaseXL>
        </StyledLink>
      </div>
    </StyledOwner>
  );
}

const StyledOwner = styled.div`
  width: 50%;
  flex-shrink: 0;
  display: flex;

  @media only screen and ${breakpoints.tablet} {
    width: 33%;
  }

  @media only screen and ${breakpoints.desktop} {
    width: 25%;
  }
`;

const StyledLink = styled(InteractiveLink)<{ fadeUsernames: boolean }>`
  text-decoration: none;
  transition: color 0.15s ease-in-out;
  color: ${({ fadeUsernames }) => (fadeUsernames ? colors.porcelain : colors.offBlack)};
  &:hover {
    color: ${colors.offBlack};
  }
`;

const StyledBaseXL = styled(BaseXL)`
  color: inherit;
`;

type Props = {
  owners: Owner[];
};

export default function CommunityPageList({ owners }: Props) {
  const { searchQuery } = useMemberListPageState();

  const sortedOwners = useMemo(() => {
    const nonNullOwners = removeNullValues(owners ?? []);

    nonNullOwners.sort((a, b) => a.username.toLowerCase().localeCompare(b.username.toLowerCase()));

    return nonNullOwners;
  }, [owners]);

  const filteredOwners = useMemo(() => {
    if (!searchQuery) {
      return sortedOwners;
    }

    if (searchQuery === '#') {
      return sortedOwners.filter((owner) => !/^[A-Za-z]/.test(owner.username));
    }

    return sortedOwners.filter((owner) =>
      owner.username.toLowerCase().startsWith(searchQuery.toLocaleLowerCase())
    );
  }, [searchQuery, sortedOwners]);

  return (
    <StyledCommunityPageList>
      {filteredOwners.map((owner) => (
        <CommunityPageUser key={owner.address} address={owner.address} username={owner.username} />
      ))}
    </StyledCommunityPageList>
  );
}

const StyledCommunityPageList = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
