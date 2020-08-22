import * as React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faHome } from '@fortawesome/free-solid-svg-icons';

interface ITopNavProps {}

const StyledTopNav = styled.div`
  font-family: 'NotoSans';
  letter-spacing: 0.1em;
  display: flex;
  position: fixed;
  height: 42px;
  width: 100%;
  background: #18242e;
  justify-content: space-between;
  box-shadow: 0 2.8px 2.2px rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

const LeftSection = styled.div`
  display: flex;
`;

const NavButton = styled.div`
  cursor: pointer;
  user-select: none;
  padding: 0 24px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const TopNav: React.FunctionComponent<ITopNavProps> = (props) => {
  return (
    <StyledTopNav>
      <LeftSection>
        <NavButton>
          {' '}
          <FontAwesomeIcon icon={faHome} />
        </NavButton>
        <NavButton>LINKS</NavButton>
        <NavButton>LOGS</NavButton>
      </LeftSection>
      <div>
        <NavButton>
          <FontAwesomeIcon icon={faCog} />
        </NavButton>
      </div>
    </StyledTopNav>
  );
};

export default TopNav;
