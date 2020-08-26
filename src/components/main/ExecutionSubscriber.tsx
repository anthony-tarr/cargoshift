import * as React from 'react';
import { currentOperationsState } from '../../recoil/Recoil';
import { useRecoilState } from 'recoil';
import { subject } from '../../OperationHandler';
import { mergeMap, first, debounce, delay, tap, map } from 'rxjs/operators';
import { interval, from } from 'rxjs';
import { useSetRecoilState } from 'recoil';
import { LinkOperation, LinkOperationType } from '../../model/LinkOperation';

interface IExecutionSubscriberProps {}

const MAX_CONCURRENT_EXECUTIONS = 5;

const ExecutionSubscriber: React.FunctionComponent<IExecutionSubscriberProps> = (props) => {
  // const setCurrentOperations = useSetRecoilState(currentOperationsState);
  const [currentOperations, setCurrentOperations] = useRecoilState(currentOperationsState);

  const handleIncoming = async (operation: LinkOperation) => {
    await sleep(2000);
    console.log('after sleep');
    //const { destination } = operation;
    // Copy directory over
    //console.log('  RUNNING COPY');
    // for (const job of operation.jobs) {
    //   switch (job.type) {
    //     case LinkOperationType.COPY: {
    //       // setCurrentOperations((oldCurrentOperations: LinkOperation[]) => {
    //       //   const currentOperations = [...oldCurrentOperations];
    //       //   console.log(currentOperations);
    //       //   const executingOperation = currentOperations.find((op) => op.id === operation.id);
    //       //   console.log(executingOperation);
    //       //   const currentJob = operation.jobs.find((job) => job.type === LinkOperationType.COPY);
    //       //   currentJob!!.inProgress = true;
    //       //   return [...oldCurrentOperations, operation];
    //       // });
    //     }
    //   }
    // }
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
        next: (v) => console.log(v),
      });
  }, []);

  return null;
};

export default ExecutionSubscriber;
