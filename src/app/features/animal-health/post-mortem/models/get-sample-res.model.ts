export interface GetSampleRes {
  samplingStatus: number;
  samplingStatusDesc: string;
  onSpotDetails: null;
  labTestingDetails: LabTestingDetail[];
}

export interface LabTestingDetail {
  sampleId: string;
  diseaseCd: number;
  diseaseCdDesc: string;
  sampleType: number;
  sampleTypeDesc: string;
  sampleCollectionDate: string;
  sampleExaminationDetails: SampleExaminationDetail[];
}

export interface SampleExaminationDetail {
  sampleId: string;
  runSeqNo: number;
  animalId: number;
  tagId: number;
  ownerId: number;
  courierId: null;
  diseaseCd: number;
  finalSampleResultValue: string;
  followUpNo: number;
  initialSampleResultValue: string;
  labCd: number;
  labCharges: number;
  modeOfTransport: number;
  onSpotTestCd: string;
  poolNoOfAnimals: string;
  receiptNo: string;
  sampleBarCd: string;
  sampleCollectionDate: string;
  sampleExaminationSubtypeCd: number;
  sampleExaminationTypeCd: number;
  sampleReport: string;
  sampleResult: string;
  sampleResultRecievedDate: string;
  sampleType: number;
  samplingStatus: number;
  sourceOriginCd: number;
  sourceOriginId: number;
  testImageUrl1: string;
  testImageUrl2: string;
  testRemarks: string;
  testingLocation: number;
  diseaseCdDesc: string;
  modeOfTransportDesc: string;
  onSpotTestDesc: string;
  sampleExaminationTypeCdDesc: string;
  sampleExaminationSubtypeCdDesc: string;
  sampleResultDesc: string;
  sampleTypeDesc: string;
  samplingStatusDesc: string;
  testingLocationDesc: string;
  labCdDesc: string;
}
