import React from 'react';
import styled from 'styled-components';
import Table from './directory/Table';
import Store from './undux/Store';
import { getSubdirectories } from './util/directory/DirectoryUtils';

const electron = window.require('electron');
const child_process = window.require('child_process');
const { remote, ipcRenderer } = electron;

const SelectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 700px;
  margin-bottom: 25px;
`;

const Path = styled.div`
  width: 300px;
`;

const Input = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const App = () => {
  const store = Store.useStore();

  const currentDirectory = store.get('currentDirectory');
  const outputDirectory = store.get('outputDirectory');
  const selectedRows = store.get('selectedRows');
  const robocopyThreads = 16;

  const handleDirectoryOpen = async () => {
    const res = await remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    const filePaths = res.filePaths;
    if (filePaths) {
      const path = filePaths[0];
      const subdirs = getSubdirectories(path);
      store.set('directoryList')(subdirs);
      store.set('currentDirectory')(path);
    }
  };

  const handleDirectoryOutDir = async () => {
    const res = await remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    const filePaths = res.filePaths;
    if (filePaths) {
      store.set('outputDirectory')(filePaths);
    }
  };

  const removeSymlink = () => {
    selectedRows.forEach((row) => {
      // Remove the symlink directory
      let spawn = child_process.spawnSync('cmd', ['/C', 'rd', row.original.path], { detached: true });
      console.log(spawn);
      if (spawn.stderr) {
        console.log(spawn.stderr.toString());
      }
      if (spawn.stdout) {
        console.log(spawn.stdout.toString());
      }

      // Copy from destination dir back to source
      spawn = child_process.spawnSync(
        'robocopy',
        ['/S', '/E', `/MT:${robocopyThreads}`, '/V', `${outputDirectory}\\${row.original.name}`, row.original.path],
        { detached: true }
      );

      // Remove destination dir
      spawn = child_process.spawnSync('cmd', ['/C', 'rd', '/S', '/Q', `${outputDirectory}\\${row.original.name}`], {
        detached: true,
      });
    });

    const subdirs = getSubdirectories(currentDirectory);
    store.set('directoryList')(subdirs);
  };

  const createSymlink = () => {
    console.log(selectedRows);
    selectedRows.forEach((row) => {
      let spawn = child_process.spawnSync(
        'robocopy',
        ['/S', '/E', `/MT:${robocopyThreads}`, '/V', row.original.path, `${outputDirectory}\\${row.original.name}`],
        { detached: true, stdio: 'pipe' }
      );

      console.log(spawn.output);

      if (spawn.stderr) {
        console.log(spawn.stderr.toString());
      }
      if (spawn.stdout) {
        console.log(spawn.stdout.toString());
      }

      spawn = child_process.spawnSync('cmd', ['/C', 'rd', '/S', '/Q', row.original.path], { detached: true });
      if (spawn.stderr) {
        console.log(spawn.stderr.toString());
      }
      if (spawn.stdout) {
        console.log(spawn.stdout.toString());
      }
      spawn = child_process.spawnSync(
        'cmd',
        ['/C', 'mklink', '/J', row.original.path, `${outputDirectory}\\${row.original.name}`],
        { detached: true }
      );
      if (spawn.stderr) {
        console.log(spawn.stderr.toString());
      }
      if (spawn.stdout) {
        console.log(spawn.stdout.toString());
      }
    });

    const subdirs = getSubdirectories(currentDirectory);
    store.set('directoryList')(subdirs);
  };

  return (
    <div>
      <SelectionHeader>
        <Path>
          <div>Source Folder</div>
          <Input>
            <div>{currentDirectory}</div>
            <button onClick={handleDirectoryOpen}>...</button>
          </Input>
        </Path>
        <Path>
          <div>Destination Folder</div>
          <Input>
            <div>{outputDirectory}</div>
            <button onClick={handleDirectoryOutDir}>...</button>
          </Input>
        </Path>
      </SelectionHeader>
      <div>
        <div>{store.get('directoryList').length > 0 && <Table />}</div>
        <div>
          <button onClick={createSymlink}>Create symlink</button>
          <button onClick={removeSymlink}>Remove symlink</button>
        </div>
      </div>
    </div>
  );
};

export default App;
