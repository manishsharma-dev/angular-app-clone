export interface SampleFormValue {
  samples: Sample[];
}

export interface Sample {
  sampleId: string;
  diseaseCd: number;
  diseaseDesc: string;
  sampleType: number;
  sampleTypeDesc: string;
  sampleExaminationDetails: SampleExaminationDetail[];
}

export interface SampleExaminationDetail {
  sampleId: string;
  sampleExaminationTypeCd: number;
  sampleExaminationSubtypeCd: number;
  labCd: number;
  labCharges: string;
  receiptNo: string;
  testRemarks: string;
  modeOfTransport: number;
  isUpdate: string;
}
