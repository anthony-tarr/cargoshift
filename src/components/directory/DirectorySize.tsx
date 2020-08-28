import * as React from 'react';
import styled from 'styled-components';

const Ellipsis = styled.div`
  .spinner {
    text-align: center;
  }

  .spinner > div {
    width: 8px;
    margin: 0 4px;
    height: 8px;
    background-color: #777;

    border-radius: 100%;
    display: inline-block;
    animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  }

  .spinner .bounce1 {
    animation-delay: -0.32s;
  }

  .spinner .bounce2 {
    animation-delay: -0.16s;
  }

  @keyframes sk-bouncedelay {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

interface ISizeProps {
  size: number | null;
}

const DirectorySize: React.FunctionComponent<ISizeProps> = ({ size }) => {
  const gigabytes = size && (size / 1024 / 1024 / 1024).toFixed(2);

  if (!size) {
    return (
      <Ellipsis>
        <div className="spinner">
          <div className="bounce1"></div>
          <div className="bounce2"></div>
          <div className="bounce3"></div>
        </div>
      </Ellipsis>
    );
  }
  return <div>{gigabytes} GB</div>;
};

export default DirectorySize;
