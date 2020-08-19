import { UseRowSelectInstanceProps } from 'react-table';

export interface DirectoryTreeRow {
  name: string;
  isLink: boolean;
  linkedPath: string;
  path: string;
}

export interface DirectoryTreeTable extends UseRowSelectInstanceProps<DirectoryTreeRow> {}
