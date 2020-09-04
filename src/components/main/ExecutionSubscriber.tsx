import * as React from 'react';
import { currentOperationsState, currentDirectoryState, directoryListState } from '../../recoil/Recoil';
import { useRecoilState } from 'recoil';
import { subject } from '../../OperationHandler';
import { mergeMap, map } from 'rxjs/operators';
import { useSetRecoilState } from 'recoil';
import { LinkOperation, LinkOperationType } from '../../model/LinkOperation';
import produce from 'immer';
import { robocopy, removeDirectory, makeLink } from '../../commands/Commands';
import { getSubdirectories } from '../../util/directory/DirectoryUtils';
import Datastore from '../../database/Datastore';

interface IExecutionSubscriberProps {}

const MAX_CONCURRENT_EXECUTIONS = 5;

const db = new Datastore();

const ExecutionSubscriber: React.FunctionComponent<IExecutionSubscriberProps> = () => {
  const [, setCurrentOperations] = useRecoilState(currentOperationsState);
  const [currentDirectory] = useRecoilState(currentDirectoryState);
  const setDirectoryList = useSetRecoilState(directoryListState);

  const updateState = (operation: LinkOperation, jobToModify: LinkOperationType, value: string) => {
    setCurrentOperations((oldCurrentOperations: LinkOperation[]) => {
      const updatedOperations = produce(oldCurrentOperations, (draftState) => {
        const executingOperation = draftState.find((op) => op.id === operation.id);
        const currentJob = executingOperation!!.jobs.find((job) => job.type === jobToModify && !job.done);
        (currentJob as any)[value] = true;
      });
      return updatedOperations;
    });
  };

  const handleIncoming = async (operation: LinkOperation) => {
    const { path, destination } = operation;

    if (operation.type === 'CREATE_LINK') {
      for (const job of operation.jobs) {
        switch (job.type) {
          case LinkOperationType.COPY: {
            updateState(operation, LinkOperationType.COPY, 'inProgress');
            await robocopy(path, destination);
            updateState(operation, LinkOperationType.COPY, 'done');
            break;
          }
          case LinkOperationType.REMOVE_DIRECTORY: {
            updateState(operation, LinkOperationType.REMOVE_DIRECTORY, 'inProgress');
            await removeDirectory(path);
            updateState(operation, LinkOperationType.REMOVE_DIRECTORY, 'done');
            break;
          }
          case LinkOperationType.MAKE_LINK: {
            updateState(operation, LinkOperationType.MAKE_LINK, 'inProgress');
            await makeLink(path, destination);
            updateState(operation, LinkOperationType.MAKE_LINK, 'done');
            break;
          }
        }
      }
    } else if (operation.type === 'REMOVE_LINK') {
      for (const job of operation.jobs) {
        switch (job.type) {
          case LinkOperationType.COPY: {
            updateState(operation, LinkOperationType.COPY, 'inProgress');
            await robocopy(destination, path);
            updateState(operation, LinkOperationType.COPY, 'done');
            break;
          }
          case LinkOperationType.REMOVE_DIRECTORY: {
            updateState(operation, LinkOperationType.REMOVE_DIRECTORY, 'inProgress');
            if (job.secondRemoval) {
              await removeDirectory(destination);
            } else {
              await removeDirectory(path);
            }
            updateState(operation, LinkOperationType.REMOVE_DIRECTORY, 'done');
            break;
          }
          case LinkOperationType.MAKE_LINK: {
            throw Error('Remove link should not be creating new symlinks');
          }
        }
      }
    }

    // Refresh our directory list after each operation
    if (operation.type === 'CREATE_LINK') {
      db.addToLinkList(path, destination);
    } else if (operation.type === 'REMOVE_LINK') {
      db.removeFromLinkList(path, destination);
    }
    const subdirs = getSubdirectories(currentDirectory);
    setDirectoryList(subdirs);
  };

  const addToState = (value) => {
    setCurrentOperations((oldCurrentOperations) => [...oldCurrentOperations, value]);
    return value;
  };

  const mergeMapHandler = (project) => {
    return handleIncoming(project);
  };

  React.useEffect(() => {
    subject
      .pipe(
        map((value) => addToState(value)),
        mergeMap(mergeMapHandler, MAX_CONCURRENT_EXECUTIONS)
      )
      .subscribe({
        next: () => {},
      });
  }, []);

  return null;
};

export default ExecutionSubscriber;
