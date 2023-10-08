// Generated by https://quicktype.io

export interface MilkSampleDetails {
  labTesting?: LabTesting | null;
  onspotTesting?: OnSpotTesting | null;
}

export interface LabTesting {
  sampleId: string;
  sampleCollectionDate: string;
  breedingExaminationType: number;
  testingLocation: number;
  breedingExaminationSubtype: number;
  tagId: number;
  labCd: number;
  testCharges: string;
  receiptNo: string;
  labName: string;
  fatPercentage: number;
  proteinPercentage: number;
  snfPercentage: number;
  lactosePercentage: string;
  somaticCellCount: string;
  milkUreaNitrogen: string;
  samplingStatus: number;
  recordingPeriod: number;
}

export interface OnSpotTesting {
  sampleId: string;
  tagId: number;
  sampleCollectionDate: string;
  breedingExaminationType: number;
  testingLocation: number;
  breedingExaminationSubtype: number;
  fatPercentage: number;
  proteinPercentage: number;
  snfPercentage: number;
  lactosePercentage: string;
  somaticCellCount: string;
  milkUreaNitrogen: string;
  samplingStatus: number;
  recordingPeriod: number;
}