import React, { useMemo, useState } from 'react';
import { useTable, useRowSelect, Row } from 'react-table';
import styled from 'styled-components';
import { Dirent } from 'fs';

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
  const [currentDir, setCurrentDir] = useState('<select a directory path>');
  const [outDir, setOutDir] = useState('<select a directory path>');
  const [directories, setDirectories] = useState([]);
  const columns = useMemo(
    () => [
      {
        Header: 'Directory',
        accessor: 'name',
      },
      {
        Header: '',
        accessor: 'isLink',
      },
      {
        Header: 'Symlink Path',
        accessor: 'linkedPath',
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    state: { selectedRowIds },
  } = useTable(
    {
      columns,
      data: directories,
    },
    useRowSelect
  );

  const mapColumns = (dir: Dirent, path: string) => {
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
      setDirectories(subdirs);
      setCurrentDir(path);
    }
  };

  const handleDirectoryOutDir = async () => {
    const res = await remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    const filePaths = res.filePaths;
    if (filePaths) {
      setOutDir(filePaths);
    }
  };

  const fileIsHidden = (path: string) => {
    try {
      const stdout = child_process.execSync(`attrib ${path}`).toString();
      const sliced = stdout.slice(0, 5);
      const isHidden = (sliced && sliced[4]) || undefined;
      console.log(isHidden);
      return isHidden === 'H';
    } catch (e) {
      // Just show the file otherwise, don't want to break things
      console.error(e);
      return true;
    }
  };

  const selectRow = (e, row) => {
    row.toggleRowSelected();
  };

  const removeSymlink = () => {
    selectedFlatRows.forEach((row) => {
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
        ['/S', '/E', '/MT:32', '/V', `${outDir}\\${row.original.name}`, row.original.path],
        { detached: true }
      );

      // Remove destination dir
      spawn = child_process.spawnSync('cmd', ['/C', 'rd', '/S', '/Q', `${outDir}\\${row.original.name}`], {
        detached: true,
      });
    });
  };

  const createSymlink = () => {
    console.log(selectedFlatRows);
    selectedFlatRows.forEach((row) => {
      let spawn = child_process.spawnSync(
        'robocopy',
        ['/S', '/E', '/MT:32', '/V', row.original.path, `${outDir}\\${row.original.name}`],
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
        ['/C', 'mklink', '/J', row.original.path, `${outDir}\\${row.original.name}`],
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

    // refresh
    const subdirs = fs
      .readdirSync(currentDir, { withFileTypes: true })
      .filter((dirent: Dirent) => {
        // const isHidden = fileIsHidden(`${path}\\${dirent.name}`);
        // if (isHidden) {
        //   return false;
        // }
        return dirent.isDirectory() || dirent.isSymbolicLink();
      })
      .map((dir: Dirent) => mapColumns(dir, currentDir));
    setDirectories(subdirs);
  };

  return (
    <div>
      <SelectionHeader>
        <Path>
          <div>Source Folder</div>
          <Input>
            <div>{currentDir}</div>
            <button onClick={handleDirectoryOpen}>...</button>
          </Input>
        </Path>
        <Path>
          <div>Destination Folder</div>
          <Input>
            <div>{outDir}</div>
            <button onClick={handleDirectoryOutDir}>...</button>
          </Input>
        </Path>
      </SelectionHeader>
      <div>
        {directories && (
          <table {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row: Row) => {
                prepareRow(row);
                return (
                  <tr
                    style={{
                      color: row.isSelected ? 'red' : 'black',
                    }}
                    onClick={(e) => selectRow(e, row)}
                    {...row.getRowProps()}
                  >
                    {row.cells.map((cell) => {
                      return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <button onClick={createSymlink}>Create symlink</button>
      <button onClick={removeSymlink}>Remove symlink</button>
    </div>
  );
};

export default App;
