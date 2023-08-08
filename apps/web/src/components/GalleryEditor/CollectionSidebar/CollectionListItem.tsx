import { useSortable } from '@dnd-kit/sortable';
import { CSSProperties, MouseEventHandler, useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { css } from 'styled-components';

import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import SettingsDropdown from '~/components/core/Dropdown/SettingsDropdown';
import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { TitleXS } from '~/components/core/Text/Text';
import { useGalleryEditorContext } from '~/components/GalleryEditor/GalleryEditorContext';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { CollectionListItemQueryFragment$key } from '~/generated/CollectionListItemQueryFragment.graphql';
import HideIcon from '~/icons/HideIcon';
import ShowIcon from '~/icons/ShowIcon';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import colors from '~/shared/theme/colors';
import unescape from '~/shared/utils/unescape';

import useMoveCollectionModal from './useMoveCollectionModal';

type CollectionListItemProps = {
  collectionId: string;
  queryRef: CollectionListItemQueryFragment$key;
};

export function CollectionListItem({ collectionId, queryRef }: CollectionListItemProps) {
  const query = useFragment(
    graphql`
      fragment CollectionListItemQueryFragment on Query {
        ...useMoveCollectionModalFragment
      }
    `,
    queryRef
  );

  const {
    collections,
    collectionIdBeingEdited,
    activateCollection,
    deleteCollection,
    editCollectionNameAndNote,
  } = useGalleryEditorContext();
  const collection = collections.find((collection) => collection.dbid === collectionId);

  if (!collection) {
    throw new ErrorWithSentryMetadata(
      'Tried to render CollectionListItem without a valid collection',
      { collectionId }
    );
  }

  const escapedCollectionName = unescape(collection.name ?? '');

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover();

  const handleMoveCollectionModal = useMoveCollectionModal({ collection, queryRef: query });

  const { hiddenCollectionIds, toggleCollectionHidden } = useGalleryEditorContext();
  const hidden = hiddenCollectionIds.has(collection.dbid);

  const handleToggleHidden = useCallback(() => {
    toggleCollectionHidden(collection.dbid);
  }, [collection.dbid, toggleCollectionHidden]);

  const selected = collectionIdBeingEdited === collectionId;

  const handleItemClick = useCallback(() => {
    activateCollection(collectionId);
  }, [activateCollection, collectionId]);

  const handleDelete = useCallback(() => {
    deleteCollection(collectionId);
  }, [collectionId, deleteCollection]);

  const handleEdit = useCallback(() => {
    editCollectionNameAndNote(collectionId);
  }, [collectionId, editCollectionNameAndNote]);

  const handleIconSectionClick = useCallback<MouseEventHandler>((event) => {
    event.stopPropagation();
  }, []);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: collectionId,
  });

  const style: CSSProperties = {
    transition,
    // Ensure they can only move along the Y axis.
    transform: transform ? `translate3d(0, ${transform?.y ?? 0}px, 0)` : 'unset',
    position: 'relative',
    zIndex: isDragging ? 1 : 'unset',
    cursor: isDragging ? 'grabbing' : 'pointer',
  };

  const collectionLabel = useMemo(() => {
    if (escapedCollectionName) {
      return escapedCollectionName;
    }

    return 'Untitled collection';
  }, [escapedCollectionName]);

  return (
    <div
      // Draggable Props
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={handleItemClick}
    >
      <CollectionListItemContainer
        role="button"
        justify="space-between"
        align="center"
        selected={selected}
      >
        <CollectionTitleText isHidden={hidden} italicize={!collection.name}>
          {collectionLabel}
        </CollectionTitleText>
        <CollectionListItemActionsContainer gap={10} onClick={handleIconSectionClick}>
          <IconContainer
            {...getReferenceProps()}
            onClick={handleToggleHidden}
            ref={reference}
            size="sm"
            disableHoverPadding
            variant="stacked"
            icon={hidden ? <HideIcon /> : <ShowIcon />}
          />
          <NewTooltip
            {...getFloatingProps()}
            style={floatingStyle}
            ref={floating}
            text={hidden ? 'Show' : 'Hide'}
          />
          <SettingsDropdown size="sm" iconVariant="stacked" disableHoverPadding>
            <DropdownSection>
              <DropdownItem onClick={handleEdit}>
                <BaseM>Edit Name & Description</BaseM>
              </DropdownItem>
              <DropdownItem onClick={handleMoveCollectionModal}>
                <BaseM>Move To...</BaseM>
              </DropdownItem>
              <DropdownItem onClick={handleDelete}>
                <BaseM color={colors.error}>Delete</BaseM>
              </DropdownItem>
            </DropdownSection>
          </SettingsDropdown>
        </CollectionListItemActionsContainer>
      </CollectionListItemContainer>
    </div>
  );
}

const CollectionTitleText = styled(TitleXS)<{ italicize: boolean; isHidden: boolean }>`
  text-transform: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  ${({ isHidden }) =>
    isHidden
      ? css`
          color: ${colors.metal};
        `
      : null}

  ${({ italicize }) =>
    italicize
      ? css`
          font-style: italic;
        `
      : null}
`;

const CollectionListItemActionsContainer = styled(HStack)`
  display: none;
`;

const CollectionListItemContainer = styled(HStack)<{ selected: boolean }>`
  margin: 0 4px;
  padding: 8px 12px;
  border-radius: 2px;

  user-select: none;
  touch-action: none;

  background: ${colors.white};

  :hover {
    background-color: ${colors.faint};
    ${CollectionListItemActionsContainer} {
      display: flex;
    }
  }

  ${({ selected }) =>
    selected
      ? css`
          background-color: ${colors.faint};

          ${CollectionTitleText} {
            font-weight: 700;
          }
          ${CollectionListItemActionsContainer} {
            display: flex;
          }
        `
      : null};
`;
