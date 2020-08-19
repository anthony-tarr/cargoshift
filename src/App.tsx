import React, { useMemo, useState } from 'react';
import { useTable, useRowSelect } from 'react-table';
import styled from 'styled-components';
import { Dirent } from 'fs';
import { DirectoryTreeRow } from './model/DirectoryTreeRow';
import Table from './directory/Table';
import Store from './undux/Store';

const fs = window.require('fs');
const electron = window.require('electron');
const child_process = window.require('child_process');
const { remote } = electron;

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

  const mapColumns = (dir: Dirent, path: string): DirectoryTreeRow => {
    const isLink = dir.isSymbolicLink();
    return {
      name: dir.name,
      isLink,
      linkedPath: isLink ? fs.readlinkSync(`${path}${dir.name}`) : null,
      path: `${path}${dir.name}`,
    };
  };

  const handleDirectoryOpen = async () => {
    const res = await remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    const filePaths = res.filePaths;
    if (filePaths) {
      const path = filePaths[0];
      const subdirs = fs
        .readdirSync(path, { withFileTypes: true })
        .filter((dirent: Dirent) => {
          // const isHidden = fileIsHidden(`${path}\\${dirent.name}`);
          // if (isHidden) {
          //   return false;
          // }
          return dirent.isDirectory() || dirent.isSymbolicLink();
        })
        .map((dir: Dirent) => mapColumns(dir, path));
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
        ['/S', '/E', '/MT:32', '/V', `${outputDirectory}\\${row.original.name}`, row.original.path],
        { detached: true }
      );

      // Remove destination dir
      spawn = child_process.spawnSync('cmd', ['/C', 'rd', '/S', '/Q', `${outputDirectory}\\${row.original.name}`], {
        detached: true,
      });
    });
  };

  const createSymlink = () => {
    selectedRows.forEach((row) => {
      let spawn = child_process.spawnSync(
        'robocopy',
        ['/S', '/E', '/MT:32', '/V', row.original.path, `${outputDirectory}\\${row.original.name}`],
        { detached: true }
      );

      console.log(spawn);
      if (spawn.stderr) {
        console.log(spawn.stderr.toString());
      }
      if (spawn.stdout) {
        console.log(spawn.stdout.toString());
      }

      spawn = child_process.spawnSync('cmd', ['/C', 'rd', '/S', '/Q', row.original.path], { detached: true });
      console.log(spawn);
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
      console.log(spawn);
      if (spawn.stderr) {
        console.log(spawn.stderr.toString());
      }
      if (spawn.stdout) {
        console.log(spawn.stdout.toString());
      }
    });

    const subdirs = fs
      .readdirSync(currentDirectory, { withFileTypes: true })
      .filter((dirent: Dirent) => {
        // const isHidden = fileIsHidden(`${path}\\${dirent.name}`);
        // if (isHidden) {
        //   return false;
        // }
        return dirent.isDirectory() || dirent.isSymbolicLink();
      })
      .map((dir: Dirent) => mapColumns(dir, currentDirectory));

    store.set('directoryList')(subdirs);
  };

  return (
    <Store.Container>
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
    </Store.Container>
  );
};

export default App;
