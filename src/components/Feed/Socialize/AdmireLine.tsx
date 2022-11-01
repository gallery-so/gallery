import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { HStack } from 'components/core/Spacer/Stack';
import styled from 'styled-components';
import { BODY_FONT_FAMILY } from 'components/core/Text/Text';
import { AdmireLineFragment$key } from '../../../../__generated__/AdmireLineFragment.graphql';
import { AdmireLineQueryFragment$key } from '../../../../__generated__/AdmireLineQueryFragment.graphql';
import { useMemo } from 'react';
import colors from 'components/core/colors';
import Link from 'next/link';
import { route, Route } from 'nextjs-routes';

type CommentLineProps = {
  admireRef: AdmireLineFragment$key;
  queryRef: AdmireLineQueryFragment$key;
};

export function AdmireLine({ admireRef, queryRef }: CommentLineProps) {
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
      <AdmirerText>admired this</AdmirerText>
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
