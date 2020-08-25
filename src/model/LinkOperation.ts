export interface LinkOperation {
  id: string;
  done: boolean;
  message: string;
  type: LinkOperationType;
  inProgress: boolean;
}

export enum LinkOperationType {
  COPY,
  REMOVE_DIRECTORY,
  MAKE_LINK,
}
