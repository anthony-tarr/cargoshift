export interface LinkOperation {
  id: string;
  type: 'CREATE_LINK' | 'REMOVE_LINK';
  done: boolean;
  inProgress: boolean;
  path: string;
  destination: string;
  jobs: LinkOperationJob[];
}

export interface LinkOperationJob {
  message: string;
  type: LinkOperationType;
  inProgress: boolean;
  secondRemoval?: boolean; // this is to mark the second removal when removing a symlink
  done: boolean;
}

export enum LinkOperationType {
  COPY,
  REMOVE_DIRECTORY,
  MAKE_LINK,
}
