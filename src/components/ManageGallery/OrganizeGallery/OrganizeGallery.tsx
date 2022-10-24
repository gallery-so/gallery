import { BaseM, BaseXL } from 'components/core/Text/Text';
import { useMemo } from 'react';
import Header from 'components/ManageGallery/OrganizeGallery/Header';
import { useFragment } from 'react-relay';
import CollectionDnd from 'components/ManageGallery/OrganizeGallery/CollectionDnd';
import { OrganizeGalleryFragment$key } from '../../../../__generated__/OrganizeGalleryFragment.graphql';
import { VStack } from 'components/core/Spacer/Stack';
import styled from 'styled-components';
import { graphql } from 'relay-runtime';
import useNotOptimizedForMobileWarning from '../useNotOptimizedForMobileWarning';

type Props = {
  onAddCollection: () => void;
  onEditCollection: (dbid: string) => void;
  queryRef: OrganizeGalleryFragment$key;
};

export function OrganizeGallery({ queryRef, onAddCollection, onEditCollection }: Props) {
  const query = useFragment(
    graphql`
      fragment OrganizeGalleryFragment on Query {
        viewer @required(action: THROW) {
          ... on Viewer {
            user @required(action: THROW) {
              username @required(action: THROW)
            }
            viewerGalleries @required(action: THROW) {
              gallery @required(action: THROW) {
                dbid

                ...CollectionDndFragment

                collections @required(action: THROW) {
                  __typename
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const gallery = query.viewer.viewerGalleries?.[0]?.gallery;

  if (!gallery) {
    throw new Error('User did not have a gallery.');
  }

  useNotOptimizedForMobileWarning();

  const isEmptyGallery = useMemo(
    () => gallery.collections.length === 0,
    [gallery.collections.length]
  );

  const navbarHeight = useGlobalNavbarHeight();

  return (
    <StyledOrganizeGallery align="center" navbarHeight={navbarHeight}>
      <Content gap={24}>
        <Header onAddCollection={onAddCollection} />
        {isEmptyGallery ? (
          <StyledEmptyGalleryMessage gap={8}>
            <BaseXL>Create your first collection</BaseXL>
            <BaseM>
              Organize your gallery with collections. Use them to group NFTs by creator, theme, or
              anything that feels right.
            </BaseM>
          </StyledEmptyGalleryMessage>
        ) : (
          <CollectionDnd onEditCollection={onEditCollection} galleryRef={gallery} />
        )}
      </Content>
    </StyledOrganizeGallery>
  );
}

const StyledOrganizeGallery = styled(VStack)<{ navbarHeight: number }>`
  padding-top: ${({ navbarHeight }) => navbarHeight}px;
`;

const StyledEmptyGalleryMessage = styled(VStack)`
  text-align: center;
  max-width: 390px;
  margin: 240px auto 0;
`;

const Content = styled(VStack)`
  width: 100%;
  padding: 0 16px 120px 0;
  max-width: 777px;
`;
