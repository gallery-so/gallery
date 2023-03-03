import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import rfdc from 'rfdc';

import { StagedSectionMap } from '~/components/GalleryEditor/GalleryEditorContext';

const deepClone = rfdc();

export function dragOver(sections: StagedSectionMap, event: DragOverEvent): StagedSectionMap {
  const activeId = event.active?.id;
  const overId = event.over?.id;

  if (!activeId || !overId) {
    return sections;
  }

  const cloned = deepClone(sections);

  const sectionIds = sections.map((section) => section.id);
  const allItems = sections.flatMap((section) => section.items);

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
    cloned.forEach((section) => {
      section.items = section.items.filter((item) => item.id !== activeId);
    });

    // Push the token to the new section
    cloned.find((section) => section.id === overId)?.items.push(item);

    return cloned;
  } else {
    // Token => Token
    const sectionWithActiveToken = cloned.find((section) =>
      section.items.some((item) => item.id === activeId)
    );
    const sectionWithOverToken = cloned.find((section) =>
      section.items.some((item) => item.id === overId)
    );

    if (
      sectionWithActiveToken &&
      sectionWithOverToken &&
      sectionWithOverToken != sectionWithActiveToken
    ) {
      const activeToken = sectionWithActiveToken.items.find((item) => item.id === activeId);

      if (activeToken) {
        const activeTokenIndex = sectionWithActiveToken.items.indexOf(activeToken);

        const overTokenIndex = sectionWithOverToken.items.findIndex((item) => item.id === overId);

        // Remove the old token
        sectionWithActiveToken.items.splice(activeTokenIndex, 1);

        const newIndex =
          overTokenIndex >= 0 ? overTokenIndex + 1 : sectionWithOverToken.items.length + 1;
        // Push the new token
        sectionWithOverToken.items.splice(newIndex, 0, activeToken);

        return cloned;
      }
    }
  }

  return sections;
}

export function dragEnd(sections: StagedSectionMap, event: DragEndEvent): StagedSectionMap {
  const activeId = event.active?.id;
  const overId = event.over?.id;

  if (!overId) {
    return sections;
  }

  const cloned = deepClone(sections);

  const sectionIds = sections.map((section) => section.id);
  const allItems = sections.flatMap((section) => section.items);

  const isTheActiveItemASection = sectionIds.includes(activeId.toString());
  const isTheOverItemASection = sectionIds.includes(overId.toString());

  if (isTheActiveItemASection && isTheOverItemASection) {
    // Section => Section
    const oldIndex = cloned.findIndex((section) => section.id === activeId);
    const newIndex = cloned.findIndex((section) => section.id === overId);

    return arrayMove(cloned, oldIndex, newIndex);
  } else if (isTheActiveItemASection && !isTheOverItemASection) {
    // Section => Token
    // In this case, we'll just assume the new position is the section owning the token
    const oldIndex = cloned.findIndex((section) => section.id === activeId);
    const newIndex = cloned.findIndex((section) =>
      section.items.some((item) => item.id === overId)
    );

    return arrayMove(cloned, oldIndex, newIndex);
  } else if (!isTheActiveItemASection && isTheOverItemASection) {
    // Token => Section
    // In this case, we'll assume they just want to go the end of the section
    const item = allItems.find((item) => item.id === activeId);

    if (!item) {
      throw new Error('Error moving Token => Section: Could not find item for id');
    }

    // Find the active token and remove it from that section
    cloned.forEach((section) => {
      section.items = section.items.filter((item) => item.id !== activeId);
    });

    // Push the token to the new section
    cloned.find((section) => section.id === overId)?.items.push(item);

    return cloned;
  } else if (!isTheActiveItemASection && !isTheOverItemASection) {
    // Token => Token
    const sectionWithActiveToken = cloned.find((section) =>
      section.items.some((item) => item.id === activeId)
    );
    const sectionWithOverToken = cloned.find((section) =>
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

      if (activeToken) {
        // Remove the old token
        sectionWithActiveToken.items.splice(activeTokenIndex, 1);
        // Push the new token
        sectionWithOverToken.items.splice(overTokenIndex, 0, activeToken);
      }
    }

    return cloned;
  }

  return sections;
}
