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
const { remote } = electron;

const Container = styled.div`
  padding: 12px;
  margin-top: 50px;
  margin-bottom: 60px;
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
  user-select: none;
  font-family: 'NotoSans';
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 12px;
  border-radius: 4px;
  color: #eee;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    pointer-events: none;
    background: rgba(1, 1, 1, 0.1);
  }
`;

const FloatingButtons = styled.div`
  position: absolute;
  width: 260px;
  display: flex;
  justify-content: space-between;
  bottom: 25px;
  right: 25px;
`;

const Content = styled.div``;

const App = () => {
  const store = Store.useStore();

  const currentDirectory = store.get('currentDirectory');
  const outputDirectory = store.get('outputDirectory');

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
    for (const row of store.get('selectedRows')) {
      const destination = `${outputDirectory}\\${row.original.name}`;
      console.log('  RUNNING COPY');
      await robocopy(row.original.path, destination);
      console.log('  RUNNING RD');
      await removeDirectory(row.original.path);
      console.log('  RUNNING MKLINK');
      await makeLink(row.original.path, destination);
    }

    console.log('refreshing directories');
    const subdirs = getSubdirectories(currentDirectory);
    store.set('directoryList')(subdirs);
  };

  const removeSymlink = async () => {
    for (const row of store.get('selectedRows')) {
      // Remove the symlink directory
      console.log('  RUNNING RD');
      await removeDirectory(row.original.path, true);

      // Copy from destination dir back to source
      console.log(`${outputDirectory}\\${row.original.name}`);
      console.log('  RUNNING COPY');
      await robocopy(`${outputDirectory}\\${row.original.name}`, row.original.path);

      // Remove destination dir
      console.log('  RUNNING RD');
      await removeDirectory(`${outputDirectory}\\${row.original.name}`);
    }

    console.log('refreshing directories');
    const subdirs = getSubdirectories(currentDirectory);
    store.set('directoryList')(subdirs);
  };

  const isCreateLinkDisabled = () => {
    const selectedRows = store.get('selectedRows');
    const hasLinkedPath = selectedRows.find((row) => row.original.linkedPath !== null);
    console.log(hasLinkedPath);
  };

  const isRemoveLinkDisabled = () => {
    console.log('am i being evaluated');
    const selectedRows = store.get('selectedRows');
    const hasLinkedPath = selectedRows.find((row) => row.original.linkedPath !== null);
    console.log(hasLinkedPath);
    if (hasLinkedPath) {
      return false;
    }
    return true;
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
              <Button disabled={isRemoveLinkDisabled()} onClick={removeSymlink}>
                Remove link
              </Button>
            </FloatingButtons>
          </Content>
        </div>
      </Container>
    </>
  );
};

export default App;
