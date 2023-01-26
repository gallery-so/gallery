import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import rfdc from 'rfdc';

import { StagedSection } from '~/components/GalleryEditor/GalleryEditorContext';

const deepClone = rfdc();

function rebuildSections(
  previous: Record<string, StagedSection>,
  newKeyOrder: string[]
): Record<string, StagedSection> {
  return newKeyOrder.reduce((acc, sectionId) => {
    return { ...acc, [sectionId]: previous[sectionId] };
  }, {});
}

export function dragOver(
  sections: Record<string, StagedSection>,
  event: DragOverEvent
): Record<string, StagedSection> {
  const activeId = event.active?.id;
  const overId = event.over?.id;

  if (!activeId || !overId) {
    return sections;
  }

  const cloned = deepClone(sections);

  const sectionIds = Object.keys(sections);
  const allItems = Object.values(sections).flatMap((section) => section.items);

  const isTheActiveItemASection = sectionIds.includes(activeId.toString());
  const isTheOverItemASection = sectionIds.includes(overId.toString());

  if (isTheActiveItemASection) {
    // This whole function only cares about token => (token | section movements)
    return sections;
  }

  if (isTheOverItemASection) {
    // Token => Section
    // In this case, we'll assume they just want to go the end of the section
    const item = allItems.find((item) => item.id === activeId);

    if (!item) {
      throw new Error('Error moving Token => Section: Could not find item for id');
    }

    // Find the active token and remove it from that section
    Object.values(cloned).forEach((section) => {
      section.items = section.items.filter((item) => item.id !== activeId);
    });

    // Push the token to the new section
    cloned[overId].items.push(item);

    return cloned;
  } else {
    // Token => Token
    const sectionWithActiveToken = Object.values(cloned).find((section) =>
      section.items.some((item) => item.id === activeId)
    );
    const sectionWithOverToken = Object.values(cloned).find((section) =>
      section.items.some((item) => item.id === overId)
    );

    if (
      sectionWithActiveToken &&
      sectionWithOverToken &&
      sectionWithOverToken != sectionWithActiveToken
    ) {
      const activeTokenIndex = sectionWithActiveToken.items.findIndex(
        (item) => item.id === activeId
      );
      const overTokenIndex = sectionWithOverToken.items.findIndex((item) => item.id === overId);

      const activeToken = sectionWithActiveToken.items[activeTokenIndex];

      // Remove the old token
      sectionWithActiveToken.items.splice(activeTokenIndex, 1);

      const newIndex =
        overTokenIndex >= 0 ? overTokenIndex + 1 : sectionWithOverToken.items.length + 1;
      // Push the new token
      sectionWithOverToken.items.splice(newIndex, 0, activeToken);

      return cloned;
    }
  }

  return sections;
}

export function dragEnd(
  sections: Record<string, StagedSection>,
  event: DragEndEvent
): Record<string, StagedSection> {
  const activeId = event.active?.id;
  const overId = event.over?.id;

  if (!overId) {
    return sections;
  }

  const cloned = deepClone(sections);

  const sectionIds = Object.keys(sections);
  const allItems = Object.values(sections).flatMap((section) => section.items);

  const isTheActiveItemASection = sectionIds.includes(activeId.toString());
  const isTheOverItemASection = sectionIds.includes(overId.toString());

  if (isTheActiveItemASection && isTheOverItemASection) {
    // Section => Section
    const oldIndex = Object.keys(cloned).findIndex((id) => id === activeId);
    const newIndex = Object.keys(cloned).findIndex((id) => id === overId);

    return rebuildSections(cloned, arrayMove(sectionIds, oldIndex, newIndex));
  } else if (isTheActiveItemASection && !isTheOverItemASection) {
    // Section => Token
    // In this case, we'll just assume the new position is the section owning the token
    const oldIndex = Object.keys(cloned).findIndex((id) => id === activeId);
    const newIndex = Object.values(cloned).findIndex((section) =>
      section.items.some((item) => item.id === overId)
    );

    return rebuildSections(cloned, arrayMove(sectionIds, oldIndex, newIndex));
  } else if (!isTheActiveItemASection && isTheOverItemASection) {
    // Token => Section
    // In this case, we'll assume they just want to go the end of the section
    const item = allItems.find((item) => item.id === activeId);

    if (!item) {
      throw new Error('Error moving Token => Section: Could not find item for id');
    }

    // Find the active token and remove it from that section
    Object.values(cloned).forEach((section) => {
      section.items = section.items.filter((item) => item.id !== activeId);
    });

    // Push the token to the new section
    cloned[overId].items.push(item);

    return cloned;
  } else if (!isTheActiveItemASection && !isTheOverItemASection) {
    // Token => Token
    const sectionWithActiveToken = Object.values(cloned).find((section) =>
      section.items.some((item) => item.id === activeId)
    );
    const sectionWithOverToken = Object.values(cloned).find((section) =>
      section.items.some((item) => item.id === overId)
    );

    if (!sectionWithActiveToken || !sectionWithOverToken) {
      throw new Error('Error moving Token => Token: Could not find section for id');
    }

    const activeTokenIndex = sectionWithActiveToken.items.findIndex((item) => item.id === activeId);
    const overTokenIndex = sectionWithOverToken.items.findIndex((item) => item.id === overId);

    // We're dragging a token in the same section
    if (sectionWithOverToken === sectionWithActiveToken) {
      sectionWithActiveToken.items = arrayMove(
        sectionWithActiveToken.items,
        activeTokenIndex,
        overTokenIndex
      );
    } else {
      const activeToken = sectionWithActiveToken.items[activeTokenIndex];

      // Remove the old token
      sectionWithActiveToken.items.splice(activeTokenIndex, 1);
      // Push the new token
      sectionWithOverToken.items.splice(overTokenIndex, 0, activeToken);
    }

    return cloned;
  }

  return sections;
}
