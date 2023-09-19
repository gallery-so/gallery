import { MissingFieldHandler } from 'relay-runtime';
import { NormalizationLinkedField } from 'relay-runtime/lib/util/NormalizationNode';
import { ReaderLinkedField } from 'relay-runtime/lib/util/ReaderNode';
import { Variables } from 'relay-runtime/lib/util/RelayRuntimeTypes';

export function createMissingFieldHandlers(): MissingFieldHandler[] {
  const handler: MissingFieldHandler = {
    kind: 'linked',
    handle: (
      field: NormalizationLinkedField | ReaderLinkedField,
      parentRecord: unknown,
      args: Variables
    ) => {
      if (field.name === 'galleryById') {
        return `Gallery:${args.id}`;
      }

      if (field.name === 'collectionById') {
        return `Collection:${args.id}`;
      }

      if (field.name === 'tokenById') {
        return `Token:${args.id}`;
      }

      return undefined;
    },
  };

  return [handler];
}
