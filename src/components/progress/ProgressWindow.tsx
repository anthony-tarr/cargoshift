import * as React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { lighten, darken } from 'polished';
import { useRecoilValue } from 'recoil';
import { currentOperationsState } from '../../recoil/Recoil';
import Job from './Job';

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
`;

const Content = styled.div`
  padding: 4px;
  transition: opacity 0.4s, height 0.5s;
  height: 0px;
  opacity: 0;
  border-radius: 2px;
  background: #1a1a2e;
  overflow-y: scroll;
  font-size: 14px;

  &.toggled {
    transition: opacity 0.1s, height 0.5s;
    height: 250px;
    opacity: 1;
  }
`;

const OperationTitle = styled.div`
  padding: 2px;
  border-bottom: 1px solid ${lighten(0.05, '#1a1a2e')};
`;

const Operation = styled.div`
  margin: 4px;
  padding: 2px;
  border: 1px solid ${lighten(0.05, '#1a1a2e')};
  background: ${darken(0.025, '#1a1a2e')};
`;

interface IProgressWindowProps {}

const ProgressWindow: React.FC<IProgressWindowProps> = () => {
  const currentOperations = useRecoilValue(currentOperationsState);

  const [contentWindowToggled, setContentWindowToggled] = React.useState(false);
  const toggleContentWindow = () => {
    setContentWindowToggled(!contentWindowToggled);
  };

  const icon = contentWindowToggled ? faChevronDown : faChevronUp;
  const progressContentClassname = classnames('progress-content', { toggled: contentWindowToggled });
  return (
    <Container>
      <Window onClick={toggleContentWindow}>
        <FontAwesomeIcon icon={icon} />
      </Window>
      <Content className={progressContentClassname}>
        {currentOperations.map((operation) => (
          <Operation>
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
