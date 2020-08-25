import * as React from 'react';
import styled from 'styled-components';
import Store from '../undux/Store';
import { robocopy, removeDirectory, makeLink } from '../commands/Commands';
import { getSubdirectories } from '../util/directory/DirectoryUtils';
import ProgressWindow from '../progress/ProgressWindow';
import { LinkOperation, LinkOperationType } from '../model/LinkOperation';
import * as uuid from 'uuid';
import { UseTableRowProps } from 'react-table';
import { DirectoryTreeRow } from '../model/DirectoryTreeRow';

const StyledActions = styled.div`
  position: absolute;
  width: 260px;
  bottom: 25px;
  right: 25px;
  z-index: 3;
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
  display: flex;
  justify-content: space-between;
  z-index: 2;
`;

interface IActionsProps {}

const Actions: React.FunctionComponent<IActionsProps> = (props) => {
  const store = Store.useStore();

  const currentDirectory = store.get('currentDirectory');
  const outputDirectory = store.get('outputDirectory');

  const getOperations = (row: UseTableRowProps<DirectoryTreeRow>, executionId: string): LinkOperation[] => {
    return [
      {
        id: executionId,
        done: false,
        message: `Copying ${row.original.name} to ${outputDirectory}`,
        type: LinkOperationType.COPY,
        inProgress: false,
      },
      {
        id: executionId,
        done: false,
        message: `Removing ${row.original.name} folder`,
        type: LinkOperationType.REMOVE_DIRECTORY,
        inProgress: false,
      },
      {
        id: executionId,
        done: false,
        message: `Creating link from ${row.original.name} to ${outputDirectory}`,
        type: LinkOperationType.MAKE_LINK,
        inProgress: false,
      },
    ];
  };

  const createSymlink = async () => {
    const rawTotalOperations = store.get('selectedRows').map((row) => {
      const executionId: string = uuid.v4();
      return getOperations(row, executionId);
    });

    const totalOperations: LinkOperation[] = ([] as LinkOperation[]).concat(...rawTotalOperations);
    store.set('currentOperations')([...store.get('currentOperations'), ...totalOperations]);

    for (const row of store.get('selectedRows')) {
      const operations: LinkOperation[] = totalOperations;

      //store.set('currentOperations')([...store.get('currentOperations'), ...operations]);

      const destination = `${outputDirectory}\\${row.original.name}`;

      // Copy directory over
      console.log('  RUNNING COPY');
      const copyExecution = operations.find((row) => row.id === executionId && row.type === LinkOperationType.COPY);
      copyExecution!!.inProgress = true;
      await robocopy(row.original.path, destination);
      copyExecution!!.done = true;
      store.set('currentOperations')([...store.get('currentOperations'), ...operations]);

      // Remove directory
      console.log('  RUNNING RD');
      const rdExecution = operations.find(
        (row) => row.id === executionId && row.type === LinkOperationType.REMOVE_DIRECTORY
      );
      rdExecution!!.inProgress = true;
      await removeDirectory(row.original.path);
      rdExecution!!.done = true;
      store.set('currentOperations')([...store.get('currentOperations'), ...operations]);

      // Make link
      console.log('  RUNNING MKLINK');
      const mkLinkExecution = operations.find(
        (row) => row.id === executionId && row.type === LinkOperationType.MAKE_LINK
      );
      mkLinkExecution!!.inProgress = true;
      await makeLink(row.original.path, destination);
      mkLinkExecution!!.done = true;

      store.set('currentOperations')([...store.get('currentOperations'), ...operations]);
    }

    console.log('refreshing directories');
    const subdirs = getSubdirectories(currentDirectory);
    store.set('directoryList')(subdirs);
  };

  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    console.log(store.get('selectedRows'));
    const selectedRows = store.get('selectedRows');
    const hasLinkedPath = selectedRows.find((row) => row.original.linkedPath !== null);
    console.log(hasLinkedPath);
    if (hasLinkedPath) {
      return false;
    }
    return true;
  };

  return (
    <StyledActions>
      <ProgressWindow />
      <FloatingButtons>
        <Button disabled={store.get('selectedRows').length < 1 || !isRemoveLinkDisabled()} onClick={createSymlink}>
          Create link
        </Button>
        <Button disabled={isRemoveLinkDisabled()} onClick={removeSymlink}>
          Remove link
        </Button>
      </FloatingButtons>
    </StyledActions>
  );
};

export default Actions;
