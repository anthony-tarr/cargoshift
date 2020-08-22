import React from 'react';
import styled from 'styled-components';
import Table from './directory/Table';
import Store from './undux/Store';
import { getSubdirectories } from './util/directory/DirectoryUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import TopNav from './navigation/TopNav';
import { robocopy, removeDirectory, makeLink } from './commands/Commands';
import './_index.scss';

const electron = window.require('electron');
const child_process = window.require('child_process');
const { remote } = electron;

const Container = styled.div`
  padding: 12px;
  margin-top: 40px;
  overflow: auto;
`;

const SelectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 700px;
  margin-bottom: 10px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 20px;
`;

const Path = styled.div`
  width: 300px;
  font-size: 14px;

  > .header {
    margin-bottom: 10px;
  }
`;

const Input = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  > .inputField {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    width: calc(100% - 20px);
    padding: 4px;
  }

  button {
    padding: 4px;
    margin-left: 8px;
  }
`;

const DirectoryButton = styled.button`
  padding: 2px;
  height: 24px;
  width: 24px;
  font-size: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 2px;
  cursor: pointer;
  color: #eee;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.1s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    border: none;
    outline: none;
  }
`;

const Button = styled.button`
  padding: 12px;
  border-radius: 4px;
  color: #eee;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.1s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const FloatingButtons = styled.div`
  position: absolute;
  width: 200px;
  display: flex;
  justify-content: space-between;
  bottom: 25px;
  right: 25px;
`;

const Content = styled.div`
  margin-bottom: 50px;
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

    if (res.canceled) {
      return;
    }

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

    if (res.canceled) {
      return;
    }

    const filePaths = res.filePaths;
    if (filePaths) {
      store.set('outputDirectory')(filePaths);
    }
  };

  const createSymlink = async () => {
    for (const row of selectedRows) {
      const destination = `${outputDirectory}\\${row.original.name}`;
      await robocopy(row.original.path, destination);
      await removeDirectory(row.original.path);
      await makeLink(row.original.path, destination);
    }

    console.log('refreshing directories');
    const subdirs = getSubdirectories(currentDirectory);
    store.set('directoryList')(subdirs);
  };

  const removeSymlink = async () => {
    for (const row of selectedRows) {
      // Remove the symlink directory
      await removeDirectory(row.original.path, true);

      // Copy from destination dir back to source
      console.log(`${outputDirectory}\\${row.original.name}`);
      await robocopy(`${outputDirectory}\\${row.original.name}`, row.original.path);

      // Remove destination dir
      await removeDirectory(`${outputDirectory}\\${row.original.name}`);
    }

    console.log('refreshing directories');
    const subdirs = getSubdirectories(currentDirectory);
    store.set('directoryList')(subdirs);
  };

  return (
    <>
      <TopNav />

      <Container>
        <div>
          <SelectionHeader>
            <Path>
              <div className="header">Source Folder</div>
              <Input>
                <div className="inputField">{currentDirectory}</div>
                <DirectoryButton onClick={handleDirectoryOpen}>
                  <FontAwesomeIcon icon={faEllipsisH} />
                </DirectoryButton>
              </Input>
            </Path>
            <Path>
              <div className="header">Destination Folder</div>
              <Input>
                <div className="inputField">{outputDirectory}</div>
                <DirectoryButton onClick={handleDirectoryOutDir}>
                  <FontAwesomeIcon icon={faEllipsisH} />
                </DirectoryButton>
              </Input>
            </Path>
          </SelectionHeader>
          <Content>
            <div>
              <Table />
            </div>
            <FloatingButtons>
              <Button onClick={createSymlink}>Create link</Button>
              <Button onClick={removeSymlink}>Remove link</Button>
            </FloatingButtons>
          </Content>
        </div>
      </Container>
    </>
  );
};

export default App;
