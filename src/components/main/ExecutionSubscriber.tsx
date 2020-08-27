import * as React from 'react';
import { currentOperationsState } from '../../recoil/Recoil';
import { useRecoilState } from 'recoil';
import { subject } from '../../OperationHandler';
import { mergeMap, first, debounce, delay, tap, map } from 'rxjs/operators';
import { interval, from } from 'rxjs';
import { useSetRecoilState } from 'recoil';
import { LinkOperation, LinkOperationType } from '../../model/LinkOperation';
import produce from 'immer';
import { robocopy } from '../../commands/Commands';

interface IExecutionSubscriberProps {}

const MAX_CONCURRENT_EXECUTIONS = 5;

function replaceItemAtIndex(arr, index, newValue) {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}

function removeItemAtIndex(arr, index) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

const ExecutionSubscriber: React.FunctionComponent<IExecutionSubscriberProps> = (props) => {
  // const setCurrentOperations = useSetRecoilState(currentOperationsState);
  const [currentOperations, setCurrentOperations] = useRecoilState(currentOperationsState);

  const handleIncoming = async (operation: LinkOperation) => {
    await sleep(1000);
    console.log(operation);
    const { path, destination } = operation;

    for (const job of operation.jobs) {
      switch (job.type) {
        case LinkOperationType.COPY: {
          setCurrentOperations((oldCurrentOperations: LinkOperation[]) => {
            const updatedOperations = produce(oldCurrentOperations, (draftState) => {
              const executingOperation = draftState.find((op) => op.id === operation.id);
              const currentJob = executingOperation!!.jobs.find((job) => job.type === LinkOperationType.COPY);
              currentJob!!.inProgress = true;
            });
            return updatedOperations;
          });
          await robocopy(path, destination);
          setCurrentOperations((oldCurrentOperations: LinkOperation[]) => {
            const updatedOperations = produce(oldCurrentOperations, (draftState) => {
              const executingOperation = draftState.find((op) => op.id === operation.id);
              const currentJob = executingOperation!!.jobs.find((job) => job.type === LinkOperationType.COPY);
              currentJob!!.done = true;
            });
            return updatedOperations;
          });
        }
      }
    }
    // const copyExecution = operation.find((row) => row.id === operation. && row.type === LinkOperationType.COPY);
    // copyExecution!!.inProgress = true;
    // await robocopy(row.original.path, destination);
    // copyExecution!!.done = true;
    // store.set('currentOperations')([...store.get('currentOperations'), ...operations]);

    // // Remove directory
    // console.log('  RUNNING RD');
    // const rdExecution = operations.find(
    //   (row) => row.id === executionId && row.type === LinkOperationType.REMOVE_DIRECTORY
    // );
    // rdExecution!!.inProgress = true;
    // await removeDirectory(row.original.path);
    // rdExecution!!.done = true;
    // store.set('currentOperations')([...store.get('currentOperations'), ...operations]);

    // // Make link
    // console.log('  RUNNING MKLINK');
    // const mkLinkExecution = operations.find(
    //   (row) => row.id === executionId && row.type === LinkOperationType.MAKE_LINK
    // );
    // mkLinkExecution!!.inProgress = true;
    // await makeLink(row.original.path, destination);
    // mkLinkExecution!!.done = true;

    // store.set('currentOperations')([...store.get('currentOperations'), ...operations]);
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
        next: (v) => {},
      });
  }, []);

  return null;
};

export default ExecutionSubscriber;
