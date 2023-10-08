export interface SaveSampleReq {
  animalId: number;
  bottleNo: string;
  boxno: string;
  breedingExaminationSubtype: number;
  breedingExaminationSubtypeOther: string;
  breedingExaminationType: number;
  breedingSampleType: number;
  fatPercentage: number;
  fatValue: number;
  isMigrated: string;
  labCd: number;
  lactosePercentage: number;
  lactoseValue: number;
  milkUreaNitrogen: number;
  mrDate: string;
  projectId: string;
  proteinPercentage: number;
  proteinValue: number;
  receiptNo: string;
  roleCd: number;
  sampleCollectionDate: string;
  sampleId: string;
  sampleReport: string;
  sampleResult: number;
  sampleResultRecievedDate: string;
  samplingStatus: number;
  snfPercentage: number;
  snfValue: number;
  somaticCellCount: number;
  testCharges: number;
  testRemarks: string;
  testResult: string;
  testingLocation: number;
}