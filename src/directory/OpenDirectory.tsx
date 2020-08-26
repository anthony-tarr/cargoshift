import * as React from 'react';
import { DirectoryTreeRow } from '../model/DirectoryTreeRow';
import { getSubdirectories } from '../util/directory/DirectoryUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { currentDirectoryState, outputDirectoryState, directoryListState } from '../recoil/Recoil';

interface IOpenDirectoryProps {
  directory: DirectoryTreeRow;
}

const StyledOpenDirectory = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  width: 60px;
`;

const OpenDirectory: React.FunctionComponent<IOpenDirectoryProps> = (props) => {
  const [currentDirectory, setCurrentDirectory] = useRecoilState(currentDirectoryState);
  const [directoryList, setDirectoryList] = useRecoilState(directoryListState);

  const openDirectory = () => {
    const subdirs = getSubdirectories(props.directory.path);
    setDirectoryList(subdirs);
    setCurrentDirectory(props.directory.path);
  };

  return (
    <StyledOpenDirectory className="open-directory" onClick={openDirectory}>
      <FontAwesomeIcon icon={faFolderOpen} />
    </StyledOpenDirectory>
  );
};

export default OpenDirectory;
