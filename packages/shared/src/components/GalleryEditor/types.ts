// Web
export type StagedItem = { kind: 'whitespace'; id: string } | { kind: 'token'; id: string };

export type StagedSection = {
  id: string;
  columns: number;
  items: StagedItem[];
};

export type StagedCollection = {
  dbid: string;
  localOnly: boolean;

  liveDisplayTokenIds: Set<string>;
  highDefinitionTokenIds: Set<string>;

  name: string;
  collectorsNote: string;
  hidden: boolean;

  sections: StagedSectionList;
  activeSectionId: string | null;
};

export type StagedSectionList = StagedSection[];
export type StagedCollectionList = StagedCollection[];

// Mobile
