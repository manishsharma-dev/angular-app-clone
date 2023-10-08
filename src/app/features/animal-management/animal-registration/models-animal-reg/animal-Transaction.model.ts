export interface AnimalTransactions {
  animalId: number;
  transactionId: number;
  tagId: number;
  modificationTitle: string;
  approvalRejectionDate: string;
  approvedRejectedBy: string;
  modificationKey: string;
  modificatioCode: number;
  animalModificationJson: AnimalModificationJSON[];
  reasonForChange: string;
  requestorRemarks?: string;
  transactionDate: string;
  transactionStatus: number;
  transactionStatusValue: string;
  modifiedBy: string;
}

export interface AnimalModificationJSON {
  key: string;
  value: any;
}

export interface ValueElement {
  breed: string;
  bloodExoticLevel: string;
}
