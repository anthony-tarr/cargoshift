import { DirectoryTreeRow } from './../model/DirectoryTreeRow';
import { createConnectedStore, Effects, Store } from 'undux';
import { Row, UseTableRowProps } from 'react-table';

type State = {
  currentDirectory: string;
  outputDirectory: string;
  directoryList: DirectoryTreeRow[];
  selectedRows: UseTableRowProps<DirectoryTreeRow>[];
};

const initialState: State = {
  currentDirectory: '<select a directory path>',
  outputDirectory: '<select a directory path>',
  directoryList: [],
  selectedRows: [],
};

export type StoreProps = {
  store: Store<State>;
};

export type StoreEffects = Effects<State>;

export default createConnectedStore(initialState);
