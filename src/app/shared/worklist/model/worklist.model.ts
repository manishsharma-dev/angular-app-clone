export interface WorkListDetails {
  numberOfRecords: number;
  pageSize: number;
  workListData: WorkListData[];
}

export interface WorkListData {
  requestId: number;
  animalId: number;
  tagId: number;
  sourceTransactionId: number;
  transactionApprovalStatus: number;
  supervisorUserId: string;
  supervisorRoleCd: number;
  requestorUserId: string;
  subModuleName: string;
  moduleName: string;
  creationDate: string;
  statusChangeDate: string;
  transactionDetailsJson: TransactionDetails;
}

export interface TransactionDetails {
  key: string;
  value: string;
}
