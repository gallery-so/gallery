import {
  dragEnd,
  dragOver,
} from '~/components/GalleryEditor/CollectionEditor/DragAndDrop/draggingActions';
import { StagedSection } from '~/components/GalleryEditor/GalleryEditorContext';

type TestCaseArgs = {
  initial: Record<string, StagedSection>;
  action: { from: string; to: string };
  result: Record<string, StagedSection>;
};

type TestCaseNoChangeArgs = {
  initial: Record<string, StagedSection>;
  action: { from: string; to: string };
};

describe('draggingActions', () => {
  describe('dragOver', () => {
    function testCase({ initial, action: { from, to }, result }: TestCaseArgs) {
      // @ts-expect-error we're just mocking whatever details the event actually needs
      expect(dragOver(initial, { over: { id: to }, active: { id: from } })).toMatchObject(result);
    }

    function testCaseNoChange({ initial, action: { from, to } }: TestCaseNoChangeArgs) {
      // @ts-expect-error we're just mocking whatever details the event actually needs
      expect(dragOver(initial, { over: { id: to }, active: { id: from } })).toMatchObject(initial);
    }

    it('can drag a token between sections', () => {
      testCase({
        initial: {
          A: {
            columns: 1,
            items: [{ kind: 'token', id: 'token-1' }],
          },
          B: {
            columns: 1,
            items: [{ kind: 'token', id: 'token-2' }],
          },
        },
        action: {
          from: 'token-1',
          to: 'B',
        },
        result: {
          A: {
            columns: 1,
            items: [],
          },
          B: {
            columns: 1,
            items: [
              { kind: 'token', id: 'token-2' },
              { kind: 'token', id: 'token-1' },
            ],
          },
        },
      });
    });

    it('can drag a token to a token in another section', () => {
      testCase({
        initial: {
          A: {
            columns: 1,
            items: [{ kind: 'token', id: 'token-1' }],
          },
          B: {
            columns: 1,
            items: [{ kind: 'token', id: 'token-2' }],
          },
        },
        action: {
          from: 'token-1',
          to: 'token-2',
        },
        result: {
          A: {
            columns: 1,
            items: [],
          },
          B: {
            columns: 1,
            items: [
              { kind: 'token', id: 'token-2' },
              { kind: 'token', id: 'token-1' },
            ],
          },
        },
      });
    });

    it('does not do anything when dragging section to section', () => {
      testCaseNoChange({
        initial: {
          A: {
            columns: 1,
            items: [],
          },
          B: {
            columns: 1,
            items: [],
          },
        },
        action: { from: 'A', to: 'B' },
      });
    });

    it('does not do anything when dragging section to token', () => {
      testCaseNoChange({
        initial: {
          A: {
            columns: 1,
            items: [],
          },
          B: {
            columns: 1,
            items: [{ kind: 'token', id: 'token-1' }],
          },
        },
        action: { from: 'A', to: 'token-1' },
      });
    });
  });

  describe('dragEnd', () => {
    function testCaseNoChange({ initial, action: { from, to } }: TestCaseNoChangeArgs) {
      // @ts-expect-error we're just mocking whatever details the event actually needs
      const result = dragEnd(initial, { over: { id: to }, active: { id: from } });

      expect(JSON.stringify(result, null, 2)).toEqual(JSON.stringify(initial, null, 2));
    }

    function testCase({ initial, action: { from, to }, result }: TestCaseArgs) {
      // @ts-expect-error we're just mocking whatever details the event actually needs
      const outcome = dragEnd(initial, { over: { id: to }, active: { id: from } });

      expect(outcome).not.toBe(initial);

      expect(JSON.stringify(outcome, null, 2)).toEqual(JSON.stringify(result, null, 2));
    }

    it('swaps tokens when dragging token over token', () => {
      testCase({
        initial: {
          A: {
            columns: 1,
            items: [
              { kind: 'token', id: 'token-1' },
              { kind: 'token', id: 'token-2' },
            ],
          },
        },
        action: { from: 'token-1', to: 'token-2' },
        result: {
          A: {
            columns: 1,
            items: [
              { kind: 'token', id: 'token-2' },
              { kind: 'token', id: 'token-1' },
            ],
          },
        },
      });
    });

    it('moves token to other section when dragging token over token in other section', () => {
      testCase({
        initial: {
          A: { columns: 1, items: [{ kind: 'token', id: 'token-1' }] },
          B: { columns: 1, items: [{ kind: 'token', id: 'token-2' }] },
        },
        action: { from: 'token-1', to: 'token-2' },
        result: {
          A: { columns: 1, items: [] },
          B: {
            columns: 1,
            items: [
              { kind: 'token', id: 'token-1' },
              { kind: 'token', id: 'token-2' },
            ],
          },
        },
      });
    });

    it('moves token to other section when dragging token over empty section', () => {
      testCase({
        initial: {
          A: { columns: 1, items: [{ kind: 'token', id: 'token-1' }] },
          B: { columns: 1, items: [] },
        },
        action: { from: 'token-1', to: 'B' },
        result: {
          A: { columns: 1, items: [] },
          B: { columns: 1, items: [{ kind: 'token', id: 'token-1' }] },
        },
      });
    });

    it('does nothing when moving token over itself', () => {
      testCaseNoChange({
        initial: {
          A: { columns: 1, items: [{ kind: 'token', id: 'token-1' }] },
          B: { columns: 1, items: [] },
        },
        action: { from: 'token-1', to: 'token-1' },
      });
    });

    it('swaps sections when moving section over another section', () => {
      testCase({
        initial: {
          A: { columns: 1, items: [] },
          B: { columns: 1, items: [] },
        },
        action: { from: 'A', to: 'B' },
        result: {
          B: { columns: 1, items: [] },
          A: { columns: 1, items: [] },
        },
      });
    });

    it('can move token over itself', () => {
      testCase({
        initial: {
          A: { columns: 1, items: [{ kind: 'token', id: 'token-1' }] },
          B: { columns: 1, items: [] },
        },
        action: { from: 'token-1', to: 'token-1' },
        result: {
          A: { columns: 1, items: [{ kind: 'token', id: 'token-1' }] },
          B: { columns: 1, items: [] },
        },
      });
    });

    it('does nothing when moving section over itself', () => {
      testCaseNoChange({
        initial: {
          A: { columns: 1, items: [{ kind: 'token', id: 'token-1' }] },
          B: { columns: 1, items: [] },
        },
        action: { from: 'A', to: 'A' },
      });
    });
  });
});
