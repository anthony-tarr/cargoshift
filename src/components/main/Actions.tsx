import * as React from 'react';
import styled from 'styled-components';
import { robocopy, removeDirectory, makeLink } from '../../commands/Commands';
import { getSubdirectories } from '../../util/directory/DirectoryUtils';
import { LinkOperation, LinkOperationType } from '../../model/LinkOperation';
import * as uuid from 'uuid';
import { UseTableRowProps } from 'react-table';
import { DirectoryTreeRow } from '../../model/DirectoryTreeRow';
import { subject } from '../../OperationHandler';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { lighten, darken } from 'polished';
import {
  currentDirectoryState,
  outputDirectoryState,
  selectedRowsState,
  currentOperationsState,
} from '../../recoil/Recoil';
import { useRecoilState } from 'recoil';
import ProgressWindow from '../progress/ProgressWindow';

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
  background: rgba(58, 26, 63, 0.9); /* #3a1a3f */
  border: 1px solid rgba(0, 0, 0, 0.2);
  /* background: #313f48; */
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  backdrop-filter: blur(5px);

  &:hover {
    background: ${lighten(0.05, '#3a1a3f')};
  }

  &:disabled {
    /* pointer-events: none; */
    cursor: not-allowed;
    background: rgba(0, 0, 0, 0.2);
  }
`;

const FloatingButtons = styled.div`
  display: flex;
  justify-content: space-between;
  z-index: 2;
`;

interface IActionsProps {}

const Actions: React.FunctionComponent<IActionsProps> = () => {
  const currentDirectory = useRecoilValue(currentDirectoryState);
  const outputDirectory = useRecoilValue(outputDirectoryState);
  const selectedRows = useRecoilValue(selectedRowsState);
  const [currentOperations, setCurrentOperations] = useRecoilState<LinkOperation[]>(currentOperationsState);

  const getExecutionOperation = (
    row: UseTableRowProps<DirectoryTreeRow>,
    executionId: string,
    sourcePath: string,
    destinationPath: string
  ): LinkOperation => {
    return {
      id: executionId,
      type: 'CREATE_LINK',
      done: false,
      inProgress: false,
      path: sourcePath,
      destination: destinationPath,
      jobs: [
        {
          done: false,
          inProgress: false,
          message: `Copying ${row.original.name} to ${outputDirectory}`,
          type: LinkOperationType.COPY,
        },
        {
          done: false,
          inProgress: false,
          message: `Removing ${row.original.name} folder`,
          type: LinkOperationType.REMOVE_DIRECTORY,
        },
        {
          done: false,
          inProgress: false,
          message: `Creating link from ${row.original.name} to ${outputDirectory}`,
          type: LinkOperationType.MAKE_LINK,
        },
      ],
    };
  };

  const getRemoveLinkOperations = (
    row: UseTableRowProps<DirectoryTreeRow>,
    executionId: string,
    sourcePath: string,
    destinationPath: string
  ): LinkOperation => {
    return {
      id: executionId,
      type: 'REMOVE_LINK',
      done: false,
      inProgress: false,
      path: sourcePath,
      destination: destinationPath,
      jobs: [
        {
          done: false,
          inProgress: false,
          message: `Removing link directory ${row.original.name}`,
          type: LinkOperationType.REMOVE_DIRECTORY,
        },
        {
          done: false,
          inProgress: false,
          message: `Copying ${outputDirectory}\\${row.original.name} to its original source: ${row.original.name}`,
          type: LinkOperationType.COPY,
        },
        {
          done: false,
          inProgress: false,
          message: `Removing directory ${outputDirectory}\\${row.original.name}`,
          secondRemoval: true,
          type: LinkOperationType.REMOVE_DIRECTORY,
        },
      ],
    };
  };

  const createSymlink = async () => {
    if (isCreateLinkDisabled()) {
      return;
    }

    const rawTotalOperations: LinkOperation[] = selectedRows.map((row: UseTableRowProps<DirectoryTreeRow>) => {
      const executionId: string = uuid.v4();
      return getExecutionOperation(row, executionId, row.original.path, `${outputDirectory}\\${row.original.name}`);
    });

    rawTotalOperations.forEach((op) => subject.next(op));
  };

  const removeSymlink = async () => {
    if (isRemoveLinkDisabled()) {
      return;
    }

    const rawTotalOperations: LinkOperation[] = selectedRows.map((row: UseTableRowProps<DirectoryTreeRow>) => {
      const executionId: string = uuid.v4();
      return getRemoveLinkOperations(row, executionId, row.original.path, `${outputDirectory}\\${row.original.name}`);
    });

    rawTotalOperations.forEach((op) => subject.next(op));
  };

  const isCreateLinkDisabled = () => {
    if (selectedRows.length < 1) {
      return true;
    }
    const hasLinkedPath = selectedRows.find(
      (row: UseTableRowProps<DirectoryTreeRow>) => row.original.linkedPath !== null
    );
    if (hasLinkedPath) {
      return true;
    }
    return false;
  };

  const isRemoveLinkDisabled = () => {
    const hasLinkedPath = selectedRows.find(
      (row: UseTableRowProps<DirectoryTreeRow>) => row.original.linkedPath !== null
    );
    if (hasLinkedPath) {
      return false;
    }
    return true;
  };

  return (
    <StyledActions>
      <ProgressWindow />
      <FloatingButtons>
        <Button disabled={isCreateLinkDisabled()} onClick={createSymlink}>
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
