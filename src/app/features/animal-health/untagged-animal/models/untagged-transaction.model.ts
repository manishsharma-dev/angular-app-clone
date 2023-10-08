export interface UntaggedTransaction {
  transactionId: number;
  minorAilmentCd: string;
  minorAilment: string;
  requestorName: string;
  requestorMobNo: number;
  villageCd: number;
  villageName: string;
  speciesCd: number;
  speciesName: string;
  diseaseCd: number;
  diseaseDesc: string;
  noTagReasonRemarks: string;
  prescriptionRemarks: string;
  sex: 'M' | 'F';
}
