import * as React from 'react';
import { DirectoryTreeRow } from '../model/DirectoryTreeRow';
import { getSubdirectories } from '../util/directory/DirectoryUtils';
import Store from '../undux/Store';

interface IOpenDirectoryProps {
  directory: DirectoryTreeRow;
}

const OpenDirectory: React.FunctionComponent<IOpenDirectoryProps> = (props) => {
  const store = Store.useStore();

  const openDirectory = () => {
    const subdirs = getSubdirectories(props.directory.path);
    store.set('directoryList')(subdirs);
    store.set('currentDirectory')(props.directory.path);
  };

  return <div onClick={openDirectory}>AAAA</div>;
};

export default OpenDirectory;
