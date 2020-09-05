import * as React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { lighten, darken } from 'polished';
import { useRecoilValue } from 'recoil';
import { currentOperationsState } from '../../recoil/Recoil';
import Job from './Job';
import DismissOperation from './DismissOperation';

const Container = styled.div`
  margin: 10px 0;
  z-index: 1;
`;

const Window = styled.div`
  cursor: pointer;
  padding: 4px;
  display: grid;
  place-items: center;
  border-radius: 2px;
  background: #1a1a2e;
  transition: 0.1s;

  &:hover {
    background: ${lighten(0.1, '#1a1a2e')};
  }

  &.toggled {
    border-radius: 0px;
    border-top-right-radius: 2px;
    border-top-left-radius: 2px;
  }

  &.maximum {
    border-radius: 0px;
    border-top-right-radius: 2px;
    border-top-left-radius: 2px;
  }
`;

const Content = styled.div`
  padding: 4px;
  transition: opacity 0.4s, height 0.5s;
  height: 0px;
  opacity: 0;
  border-bottom-right-radius: 2px;
  border-bottom-left-radius: 2px;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(2px);
  overflow-y: scroll;
  font-size: 14px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.11), 0 2px 2px rgba(0, 0, 0, 0.11), 0 4px 4px rgba(0, 0, 0, 0.11),
    0 8px 8px rgba(0, 0, 0, 0.11), 0 16px 16px rgba(0, 0, 0, 0.11), 0 32px 32px rgba(0, 0, 0, 0.11);

  &.toggled {
    transition: opacity 0.1s, height 0.5s;
    height: 250px;
    opacity: 1;
  }

  &.maximum {
    transition: opacity 0.1s, height 0.5s;
    height: calc(100vh - 200px);
    opacity: 1;
  }
`;

const OperationTitle = styled.div`
  padding: 2px;
  border-bottom: 1px solid ${lighten(0.05, '#1a1a2e')};
`;

const Operation = styled.div`
  position: relative;
  margin: 4px;
  padding: 2px;
  border: 1px solid ${lighten(0.05, '#1a1a2e')};
  background: ${darken(0.025, '#1a1a2e')};
`;

const NoJobs = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  color: #aaa;
  place-items: center;
  text-align: center;
  padding: 10px;
`;

enum WINDOW_MAX_HEIGHT_STATE {
  CLOSED,
  OPEN,
  LARGE,
}

interface IProgressWindowProps {}

const ProgressWindow: React.FC<IProgressWindowProps> = () => {
  const currentOperations = useRecoilValue(currentOperationsState);

  const [contentWindowToggled, setContentWindowToggled] = React.useState(WINDOW_MAX_HEIGHT_STATE.CLOSED);

  const toggleContentWindow = () => {
    setContentWindowToggled((oldValue) => {
      switch (oldValue) {
        case WINDOW_MAX_HEIGHT_STATE.CLOSED:
          return WINDOW_MAX_HEIGHT_STATE.OPEN;
        case WINDOW_MAX_HEIGHT_STATE.OPEN:
          return WINDOW_MAX_HEIGHT_STATE.LARGE;
        case WINDOW_MAX_HEIGHT_STATE.LARGE:
          return WINDOW_MAX_HEIGHT_STATE.CLOSED;
      }
    });
  };

  const displayNoJobsMessage = () => {
    if (!currentOperations || currentOperations.length < 1) {
      return (
        <NoJobs>
          <div>
            No jobs to display.
            <br />
            <br />
            This is where any currently running executions or finished jobs will appear.
          </div>
        </NoJobs>
      );
    }

    return null;
  };

  const icon = contentWindowToggled === WINDOW_MAX_HEIGHT_STATE.LARGE ? faChevronDown : faChevronUp;
  const progressContentClassname = classnames('progress-content', {
    toggled: contentWindowToggled === WINDOW_MAX_HEIGHT_STATE.OPEN,
    maximum: contentWindowToggled === WINDOW_MAX_HEIGHT_STATE.LARGE,
  });
  return (
    <Container>
      <Window onClick={toggleContentWindow} className={progressContentClassname}>
        <FontAwesomeIcon icon={icon} />
      </Window>
      <Content className={progressContentClassname}>
        {displayNoJobsMessage()}
        {currentOperations.map((operation) => (
          <Operation>
            <DismissOperation operation={operation} />
            {operation.jobs.map((job) => (
              <Job inProgress={job.inProgress} done={job.done}>
                {job.message}
              </Job>
            ))}
          </Operation>
        ))}
      </Content>
    </Container>
  );
};

export default ProgressWindow;
