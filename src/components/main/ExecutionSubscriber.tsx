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

interface IExecutionSubscriberProps {}

const MAX_CONCURRENT_EXECUTIONS = 5;

const ExecutionSubscriber: React.FunctionComponent<IExecutionSubscriberProps> = () => {
  const [, setCurrentOperations] = useRecoilState(currentOperationsState);
  const [currentDirectory] = useRecoilState(currentDirectoryState);
  const setDirectoryList = useSetRecoilState(directoryListState);

  const updateState = (operation: LinkOperation, jobToModify: LinkOperationType, value: string) => {
    setCurrentOperations((oldCurrentOperations: LinkOperation[]) => {
      const updatedOperations = produce(oldCurrentOperations, (draftState) => {
        const executingOperation = draftState.find((op) => op.id === operation.id);
        const currentJob = executingOperation!!.jobs.find((job) => job.type === jobToModify);
        (currentJob as any)[value] = true;
      });
      return updatedOperations;
    });
  };

  const handleIncoming = async (operation: LinkOperation) => {
    await sleep(1000);
    console.log(operation);
    const { path, destination } = operation;

    for (const job of operation.jobs) {
      switch (job.type) {
        case LinkOperationType.COPY: {
          /**
           * ROBOCOPY
           */
          updateState(operation, LinkOperationType.COPY, 'inProgress');
          await robocopy(path, destination);
          updateState(operation, LinkOperationType.COPY, 'done');
          /**
           * Remove Directory
           */
          setCurrentOperations((oldCurrentOperations: LinkOperation[]) => {
            const updatedOperations = produce(oldCurrentOperations, (draftState) => {
              const executingOperation = draftState.find((op) => op.id === operation.id);
              const currentJob = executingOperation!!.jobs.find(
                (job) => job.type === LinkOperationType.REMOVE_DIRECTORY
              );
              currentJob!!.inProgress = true;
            });
            return updatedOperations;
          });
          await removeDirectory(path);
          setCurrentOperations((oldCurrentOperations: LinkOperation[]) => {
            const updatedOperations = produce(oldCurrentOperations, (draftState) => {
              const executingOperation = draftState.find((op) => op.id === operation.id);
              const currentJob = executingOperation!!.jobs.find(
                (job) => job.type === LinkOperationType.REMOVE_DIRECTORY
              );
              currentJob!!.done = true;
            });
            return updatedOperations;
          });
          /**
           * Make Link
           */
          setCurrentOperations((oldCurrentOperations: LinkOperation[]) => {
            const updatedOperations = produce(oldCurrentOperations, (draftState) => {
              const executingOperation = draftState.find((op) => op.id === operation.id);
              const currentJob = executingOperation!!.jobs.find((job) => job.type === LinkOperationType.MAKE_LINK);
              currentJob!!.inProgress = true;
            });
            return updatedOperations;
          });
          await makeLink(path, destination);
          setCurrentOperations((oldCurrentOperations: LinkOperation[]) => {
            const updatedOperations = produce(oldCurrentOperations, (draftState) => {
              const executingOperation = draftState.find((op) => op.id === operation.id);
              const currentJob = executingOperation!!.jobs.find((job) => job.type === LinkOperationType.MAKE_LINK);
              currentJob!!.done = true;
            });
            return updatedOperations;
          });
        }
      }
    }

    // Refresh our directory list after each operation
    const subdirs = getSubdirectories(currentDirectory);
    setDirectoryList(subdirs);
  };

  const sleep = (ms = 2000) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const addToState = (value) => {
    setCurrentOperations((oldCurrentOperations) => [...oldCurrentOperations, value]);
    return value;
  };

  const mergeMapHandler = (project) => {
    console.log(project);
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
