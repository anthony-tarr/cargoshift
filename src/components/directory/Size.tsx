import * as React from 'react';
import { readFolderSize } from '../../util/directory/DirectoryUtils';
import styled from 'styled-components';

interface ISizeProps {
  path: string;
}

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

const Size: React.FunctionComponent<ISizeProps> = (props) => {
  const [directorySize, setDirectorySize] = React.useState<number | null>(null);
  const gigabytes = directorySize && (directorySize / 1024 / 1024 / 1024).toFixed(2);

  React.useEffect(() => {
    readFolderSize(props.path, (err, size) => {
      setDirectorySize(size);
    });
  });

  if (directorySize === null) {
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

export default Size;
