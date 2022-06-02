import { Directions } from 'components/core/enums';

export type VisibilityState = 'hidden-left' | 'visible' | 'hidden-right';
export type MountedNft<T> = { token: T; visibility: VisibilityState };

// moves a triptych of NFTs to the left or right, and toggles visibility accordingly.
// see unit tests for more details.
export default function shiftNftCarousel<T>(
  direction: Directions,
  elements: { token: any; visibility: VisibilityState }[],
  currentElementIndex: number,
  collection: T[]
): MountedNft<T>[] {
  const shiftedElements: MountedNft<T>[] = [];

  // moving carousel to the right
  if (direction === Directions.RIGHT) {
    elements.forEach((element) => {
      // do nothing; this element is essentially being popped out
      if (element.visibility === 'hidden-left') {
        return;
      }
      if (element.visibility === 'visible') {
        shiftedElements.push({ ...element, visibility: 'hidden-left' });
      }
      if (element.visibility === 'hidden-right') {
        shiftedElements.push({ ...element, visibility: 'visible' });
      }
    });
    const nextOnDeck = collection[currentElementIndex + 2];
    if (nextOnDeck) {
      shiftedElements.push({ token: nextOnDeck, visibility: 'hidden-right' });
    }
    return shiftedElements;
  }

  // moving carousel to the left
  const nextOnDeck = collection[currentElementIndex - 2];
  if (nextOnDeck) {
    shiftedElements.push({ token: nextOnDeck, visibility: 'hidden-left' });
  }
  elements.forEach((element) => {
    if (element.visibility === 'hidden-left') {
      shiftedElements.push({ ...element, visibility: 'visible' });
    }
    if (element.visibility === 'visible') {
      shiftedElements.push({ ...element, visibility: 'hidden-right' });
    }
    // do nothing; this element is essentially being popped out
    if (element.visibility === 'hidden-right') {
      return;
    }
  });
  return shiftedElements;
}
