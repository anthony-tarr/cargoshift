import * as React from 'react';
import styled from 'styled-components';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LinkOperation } from '../../model/LinkOperation';
import { useRecoilState } from 'recoil';
import { currentOperationsState } from '../../recoil/Recoil';
import produce from 'immer';

interface IDismissOperationProps {
  operation: LinkOperation;
}

const StyledDismissOperation = styled.div`
  padding: 4px 10px 4px 4px;
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  background: rgb(0, 0, 0);
  background: linear-gradient(207deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 75%);
  justify-content: flex-end;
  transition: all 0.2s ease-in-out;
  opacity: 0;

  &:hover {
    opacity: 1;
  }
`;

const IconContainer = styled.div`
  color: #dd543a;

  .dismiss-icon {
    &:hover {
      color: #e06750;
    }
  }
`;

const DismissOperation: React.FunctionComponent<IDismissOperationProps> = (props) => {
  const [currentOperations, setCurrentOperations] = useRecoilState<LinkOperation[]>(currentOperationsState);

  const dismissOperation = () => {
    setCurrentOperations((oldCurrentOperations: LinkOperation[]) => {
      const updatedOperations = produce(oldCurrentOperations, (draftState) => {
        const operationToBeDismissedIndex = draftState.findIndex((op) => op.id === props.operation.id);
        draftState.splice(operationToBeDismissedIndex, 1);
      });
      return updatedOperations;
    });
  };

  if (!props.operation.done) {
    return null;
  }

  return (
    <StyledDismissOperation>
      <IconContainer>
        <FontAwesomeIcon onClick={dismissOperation} className="dismiss-icon" icon={faWindowClose} />
      </IconContainer>
    </StyledDismissOperation>
  );
};

export default DismissOperation;
