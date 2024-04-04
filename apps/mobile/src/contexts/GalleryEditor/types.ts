import { GalleryEditorTokenPreviewFragment$key } from '~/generated/GalleryEditorTokenPreviewFragment.graphql';

export type StagedItem =
  | { kind: 'whitespace'; id: string }
  | { kind: 'token'; id: string; tokenRef: GalleryEditorTokenPreviewFragment$key };

export type StagedRow = {
  id: string;
  columns: number;
  items: StagedItem[];
};
export type StagedRowList = StagedRow[];

export type StagedSection = {
  dbid: string;
  localOnly: boolean;

  liveDisplayTokenIds: Set<string>;
  highDefinitionTokenIds: Set<string>;

  name: string;
  collectorsNote: string;
  hidden: boolean;

  rows: StagedRowList;
  activeRowId: string | null;
};

export type StagedSectionList = StagedSection[];
