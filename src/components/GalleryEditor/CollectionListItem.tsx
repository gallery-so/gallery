import { useFloating, useHover, useInteractions } from '@floating-ui/react';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled, { css } from 'styled-components';

import colors from '~/components/core/colors';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import SettingsDropdown from '~/components/core/Dropdown/SettingsDropdown';
import IconContainer from '~/components/core/Markdown/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleXS } from '~/components/core/Text/Text';
import { useGalleryEditorContext } from '~/components/GalleryEditor/GalleryEditorContext';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { CollectionListItemFragment$key } from '~/generated/CollectionListItemFragment.graphql';
import HideIcon from '~/icons/HideIcon';
import ShowIcon from '~/icons/ShowIcon';
import unescape from '~/utils/unescape';

type CollectionListItemProps = {
  collectionRef: CollectionListItemFragment$key;
};

export function CollectionListItem({ collectionRef }: CollectionListItemProps) {
  const collection = useFragment(
    graphql`
      fragment CollectionListItemFragment on Collection {
        dbid
        name
      }
    `,
    collectionRef
  );

  const escapedCollectionName = unescape(collection.name ?? '');

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover();

  const { hiddenCollectionIds, toggleCollectionHidden } = useGalleryEditorContext();
  const hidden = hiddenCollectionIds.has(collection.dbid);

  const handleToggleHidden = useCallback(() => {
    toggleCollectionHidden(collection.dbid);
  }, [collection.dbid, toggleCollectionHidden]);

  return (
    <CollectionListItemContainer role="button" justify="space-between" align="center">
      <CollectionTitleText italicize={!collection.name}>
        {escapedCollectionName}
      </CollectionTitleText>
      <HStack gap={2}>
        <IconContainer
          {...getReferenceProps()}
          onClick={handleToggleHidden}
          ref={reference}
          size="sm"
          stacked
          icon={hidden ? <ShowIcon /> : <HideIcon />}
        />

        <NewTooltip
          {...getFloatingProps()}
          style={floatingStyle}
          ref={floating}
          text={hidden ? 'Show' : 'Hide'}
        />

        <SettingsDropdown size="sm" stacked>
          <DropdownSection>
            <DropdownItem>EDIT NAME & DESC</DropdownItem>
            <DropdownItem>DELETE</DropdownItem>
          </DropdownSection>
        </SettingsDropdown>
      </HStack>
    </CollectionListItemContainer>
  );
}

const CollectionTitleText = styled(TitleXS)<{ italicize: boolean }>`
  text-transform: none;

  ${({ italicize }) =>
    italicize
      ? css`
          font-style: italic;
        `
      : null}
`;

const CollectionListItemContainer = styled(HStack)`
  margin: 0 4px;
  padding: 8px 12px;

  cursor: pointer;

  :hover {
    background-color: ${colors.faint};
  }
`;
