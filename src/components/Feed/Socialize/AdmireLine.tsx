import Link from 'next/link';
import { Route, route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import { AdmireLineFragment$key } from '~/generated/AdmireLineFragment.graphql';
import { AdmireLineQueryFragment$key } from '~/generated/AdmireLineQueryFragment.graphql';

type CommentLineProps = {
  totalAdmires: number;
  admireRef: AdmireLineFragment$key;
  queryRef: AdmireLineQueryFragment$key;
};

export function AdmireLine({ admireRef, queryRef, totalAdmires }: CommentLineProps) {
  const admire = useFragment(
    graphql`
      fragment AdmireLineFragment on Admire {
        dbid

        admirer {
          dbid
          username
        }
      }
    `,
    admireRef
  );

  const query = useFragment(
    graphql`
      fragment AdmireLineQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const admirerName = useMemo(() => {
    const isTheAdmirerTheLoggedInUser = query.viewer?.user?.dbid === admire.admirer?.dbid;

    if (isTheAdmirerTheLoggedInUser) {
      return 'You';
    } else if (admire.admirer?.username) {
      return admire.admirer.username;
    } else {
      return '<unknown>';
    }
  }, [admire.admirer?.dbid, admire.admirer?.username, query.viewer?.user?.dbid]);

  const admirerLinkRoute: Route = admire.admirer?.username
    ? { pathname: '/[username]', query: { username: admire.admirer.username } }
    : { pathname: '/' };

  const admirerLink = route(admirerLinkRoute);

  return (
    <HStack gap={4} align="flex-end">
      <Link href={admirerLinkRoute}>
        <AdmirerName href={admirerLink}>{admirerName}</AdmirerName>
      </Link>
      {totalAdmires === 1 ? (
        <AdmirerText>admired this</AdmirerText>
      ) : (
        <AdmirerText>
          {/*                                  |-- Checking for two here since we have  */}
          {/*                                  |   to subtract one to get the remaining count */}
          and {totalAdmires - 1} {totalAdmires === 2 ? 'other' : 'others'} admired this
        </AdmirerText>
      )}
    </HStack>
  );
}

const AdmirerName = styled.a`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 1;
  font-weight: 700;

  text-decoration: none;
  color: ${colors.offBlack};
`;

const AdmirerText = styled.div`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 1;
  font-weight: 400;

  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
