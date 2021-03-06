import 'regenerator-runtime/runtime';
import React from 'react';
import styled from 'styled-components';
import Table from './components/directory/Table';
import { getSubdirectories } from './util/directory/DirectoryUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import TopNav from './components/navigation/TopNav';
import Actions from './components/main/Actions';
import { useRecoilState } from 'recoil';
import { currentDirectoryState, outputDirectoryState, directoryListState } from './recoil/Recoil';
import './_index.scss';
import { useSetRecoilState } from 'recoil';
import Datastore from './database/Datastore';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
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

  &:before {
    z-index: -1;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    content: ' ';
    filter: blur(15px);
    transform: scale(1.2);
  }
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

const Content = styled.div``;

const db = new Datastore();

const App = () => {
  const [currentDirectory, setCurrentDirectory] = useRecoilState(currentDirectoryState);
  const [outputDirectory, setOutputDirectory] = useRecoilState(outputDirectoryState);
  const setDirectoryList = useSetRecoilState(directoryListState);

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
      setDirectoryList(subdirs);
      setCurrentDirectory(path);
      db.upsert({ settings: 'directories' }, { $set: { currentDirectory: path } });
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
      setOutputDirectory(filePaths);
    }
  };

  return (
    <>
      <Router>
        <TopNav />
        <Container>
          <Switch>
            <Route exact path="/">
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
                  <Actions />
                </Content>
              </div>
            </Route>
            <Route path="/links">
              <div>Links</div>
            </Route>
            <Route path="/settings">
              <div>Settings</div>
            </Route>
          </Switch>
        </Container>
      </Router>
    </>
  );
};

export default App;
