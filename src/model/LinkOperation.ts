export interface LinkOperation {
  id: string;
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
  done: boolean;
}

export enum LinkOperationType {
  COPY,
  REMOVE_DIRECTORY,
  MAKE_LINK,
}
