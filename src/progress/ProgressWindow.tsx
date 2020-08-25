import * as React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { lighten } from 'polished';
import Store from '../undux/Store';

const Container = styled.div`
  margin: 10px 0;
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

  &.toggled {
    transition: opacity 0.1s, height 0.5s;
    height: 250px;
    opacity: 1;
  }
`;

const Operation = styled.div`
  color: ${(props) => (props.done ? 'red' : 'black')};
`;

interface IProgressWindowProps {}

const ProgressWindow: React.FunctionComponent<IProgressWindowProps> = (props) => {
  const store = Store.useStore();

  const [contentWindowToggled, setContentWindowToggled] = React.useState(false);
  const toggleContentWindow = () => {
    console.log(contentWindowToggled);
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
        {store.get('currentOperations').map((operation) => (
          <Operation done={operation.done}>{operation.message}</Operation>
        ))}
      </Content>
    </Container>
  );
};

export default ProgressWindow;
