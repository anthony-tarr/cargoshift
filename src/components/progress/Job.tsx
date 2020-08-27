import * as React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { faHourglass } from '@fortawesome/free-regular-svg-icons';

interface IJobProps {
  inProgress: boolean;
  done: boolean;
}

const StyledJob = styled.div`
  display: flex;
  padding: 2px;
  color: ${(props: { done: boolean; inProgress: boolean }) => {
    if (props.done) {
      return '#2dc937';
    }

    if (props.inProgress) {
      return '#e7b416';
    }

    return '#ddd';
  }};
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 6px 0 4px;
  min-width: 12px;
`;

const Content = styled.div``;

const Job: React.FunctionComponent<IJobProps> = (props) => {
  const renderIcon = () => {
    if (props.done) {
      return <FontAwesomeIcon icon={faCheckSquare} />;
    }

    if (props.inProgress) {
      return <FontAwesomeIcon icon={faCircleNotch} spin />;
    }

    return <FontAwesomeIcon icon={faHourglass} />;
  };

  return (
    <StyledJob {...props}>
      <IconContainer>{renderIcon()}</IconContainer>
      <Content>{props.children}</Content>
    </StyledJob>
  );
};

export default Job;
