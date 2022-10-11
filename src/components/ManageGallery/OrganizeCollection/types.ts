import { UniqueIdentifier } from '@dnd-kit/core';

export type EditModeTokenChild = {
  dbid: string;
  name: string;
  lastUpdated: number;
};

export type EditModeToken = {
  id: string;
  token: EditModeTokenChild;
  isSelected?: boolean;
};

export type WhitespaceBlock = {
  // This is here to help with union discrimination in typescript
  whitespace: 'whitespace';
  id: string;
};

// Accepted types for the Dnd Collection Editor
export type StagingItem = EditModeToken | WhitespaceBlock;

export function isEditModeToken(item: StagingItem): item is EditModeToken {
  return !!item && 'token' in item && !!item.token;
}

export type Section = {
  columns: number;
  items: StagingItem[];
};

export type StagedCollection = Record<UniqueIdentifier, Section>;
