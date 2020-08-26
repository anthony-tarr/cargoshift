import { LinkOperation } from './../model/LinkOperation';
import { atom } from 'recoil';
import Datastore from '../database/Datastore';
import { getSubdirectories } from '../util/directory/DirectoryUtils';

export const NO_DIR_MESSAGE = '<select a directory path>';

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

export const currentDirectoryState = atom<string>({
  key: 'currentDirectoryState',
  default: setCurrentDirectory(),
});

export const outputDirectoryState = atom<string>({
  key: 'outputDirectoryState',
  default: setOutputDirectory(),
});

export const directoryListState = atom({
  key: 'directoryListState',
  default: setDirectoryList(),
});

export const selectedRowsState = atom({
  key: 'selectedRowsState',
  default: [],
});

export const currentOperationsState = atom<LinkOperation[]>({
  key: 'currentOperationsState',
  default: [],
});
