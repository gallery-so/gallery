import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

import { MentionDataType, updateMentionPositions } from './useMentionableMessage';

describe('updateMentionPositions', () => {
  it('It should correctly identify and update the positions of mentions in a text string.', () => {
    const text = '@gallery Love what you guys doing';
    const mentions: MentionDataType[] = [
      {
        interval: {
          start: 0,
          length: 0,
        },
        userId: 'abc',
        label: 'gallery',
      },
    ];

    const updatedMentions = updateMentionPositions(text, mentions);

    const expectedMentions: MentionDataType[] = [
      {
        interval: {
          start: 0,
          length: 8,
        },
        userId: 'abc',
        label: 'gallery',
      },
    ];

    expect(uniqWith(updatedMentions, isEqual)).toEqual(expectedMentions);

    const secondText = '@gallery Love what you guys doing - @kaito @robin';
    mentions.push({
      interval: {
        start: 0,
        length: 0,
      },
      userId: 'abc',
      label: 'kaito',
    });

    expect(uniqWith(updateMentionPositions(secondText, mentions), isEqual)).toEqual([
      ...expectedMentions,
      {
        interval: {
          start: 36,
          length: 6,
        },
        userId: 'abc',
        label: 'kaito',
      },
    ]);

    const thirdText = '@gallery Love what you guys doing - @kaito @robin';

    mentions.push({
      interval: {
        start: 0,
        length: 0,
      },
      userId: '123',
      label: 'robin',
    });

    expect(uniqWith(updateMentionPositions(thirdText, mentions), isEqual)).toEqual([
      ...expectedMentions,
      {
        interval: {
          start: 36,
          length: 6,
        },
        userId: 'abc',
        label: 'kaito',
      },
      {
        interval: {
          start: 43,
          length: 6,
        },
        userId: '123',
        label: 'robin',
      },
    ]);

    const fourthText = '@GALLERY @gallery Love what you guys doing - @kaito @robin';
    mentions.push({
      interval: {
        start: 0,
        length: 0,
      },
      userId: '123',
      label: 'GALLERY',
    });

    expect(uniqWith(updateMentionPositions(fourthText, mentions), isEqual)).toEqual([
      {
        interval: { start: 9, length: 8 },
        userId: 'abc',
        label: 'gallery',
      },
      { interval: { start: 45, length: 6 }, userId: 'abc', label: 'kaito' },
      { interval: { start: 52, length: 6 }, userId: '123', label: 'robin' },
      {
        interval: { start: 0, length: 8 },
        userId: '123',
        label: 'GALLERY',
      },
    ]);
  });
});
