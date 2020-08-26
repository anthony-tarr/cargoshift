import { DirectoryTreeRow } from './../model/DirectoryTreeRow';
import { createConnectedStore, Effects, Store, createStore, connect } from 'undux';
import { UseTableRowProps } from 'react-table';
import Datastore from '../database/Datastore';
import { getSubdirectories } from '../util/directory/DirectoryUtils';
import { LinkOperation } from '../model/LinkOperation';

export const NO_DIR_MESSAGE = '<select a directory path>';

type State = {
  currentDirectory: string;
  outputDirectory: string;
  directoryList: DirectoryTreeRow[];
  selectedRows: UseTableRowProps<DirectoryTreeRow>[];
  currentOperations: LinkOperation[];
};

const db = new Datastore();
const settings = db.find({ settings: 'directories' });

const setCurrentDirectory = () => {
  if (settings && settings.length > 0 && settings[0].currentDirectory) {
    return settings[0].currentDirectory;
  }
  return NO_DIR_MESSAGE;
};

const setOutputDirectory = () => {
  if (settings && settings.length > 0 && settings[0].outputDirectory) {
    return settings[0].outputDirectory;
  }
  return NO_DIR_MESSAGE;
};

const setDirectoryList = () => {
  const currentDirectory = setCurrentDirectory();
  if (setCurrentDirectory() !== NO_DIR_MESSAGE) {
    const subdirs = getSubdirectories(currentDirectory);
    return subdirs;
  }
  return [];
};

const initialState: State = {
  currentDirectory: setCurrentDirectory(),
  outputDirectory: setOutputDirectory(),
  directoryList: setDirectoryList(),
  selectedRows: [],
  currentOperations: [],
};

export type StoreProps = {
  store: Store<State>;
};

export type StoreEffects = Effects<State>;

const effects: Effects<State> = (store) => {
  const db = new Datastore();

  store.on('currentDirectory').subscribe((dir) => {
    db.upsert({ settings: 'directories' }, { $set: { currentDirectory: dir } });
    console.log('subscription', dir);
  });

  store.on('outputDirectory').subscribe((dir) => {
    db.upsert({ settings: 'directories' }, { $set: { outputDirectory: dir[0] } });
    console.log('subscription', dir[0]);
  });

  store.on('currentOperations').subscribe((operation) => {
    console.log('Recieved a new operation');
    console.log(operation);
  });

  return store;
};

const store = createConnectedStore(initialState, effects);

export default store;
