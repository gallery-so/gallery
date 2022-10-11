import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryRightContentFragment$key } from '__generated__/GalleryRightContentFragment.graphql';
import styled from 'styled-components';
import { TitleXS } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Link from 'next/link';

type GalleryRightContentProps = {
  queryRef: GalleryRightContentFragment$key;
};

export function GalleryRightContent({ queryRef }: GalleryRightContentProps) {
  const query = useFragment(
    graphql`
      fragment GalleryRightContentFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }
      }
    `,
    queryRef
  );

  // If the user isn't logged in, we shouldn't show an edit button
  if (query.viewer?.__typename !== 'Viewer') {
    return null;
  }

  return (
    <Link href="/edit">
      <EditButtonContainer href="/edit">
        <TitleXS>EDIT</TitleXS>
      </EditButtonContainer>
    </Link>
  );
}

const EditButtonContainer = styled.a`
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;

  cursor: pointer;

  :hover {
    background-color: ${colors.faint};
  }
`;
