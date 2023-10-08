export interface TreatmentHistory {
  diseaseDetails: DiseaseDetails[];
  medicineDetails: MedicineDetails[];
  radiologyDetails: RadiologyDetail[];
  sampleDetails: SampleDetails;
  surgeryPerformedDetails: SurgeryPerformedDetail[];
  symptomDetails: SymptomDetails[];
  treatmentDetails: TreatmentDetails;
}

export interface DiseaseDetails {
  diseaseCd: number;
  followUpNo: number;
  originId: number;
  otherDisease: string;
  remarks: string;
  runSeqNo: number;
  sourceOriginCd: number;
  name?: string;
  remark?: string;
}

export interface MedicineDetails {
  caseId: number;
  dosage: string;
  followUpNo: number;
  formCd: number;
  medicineCd: number;
  medicineDuration: number;
  medicineFrequency: number;
  medicineOther: string;
  medicinePrescribedOnlyFlag: string;
  remarks: string;
  routeCd: number;
  runSeqNo: number;
  unitCd: number;
}

export interface RadiologyDetail {
  radiologyReportDate: string;
  radiologyReportType: number;
  radiologyReportTypeDesc: string;
  reportObservationsRemarks: string;
  testImageUrl1: string;
  testImageUrl2: string;
}

export interface SampleDetails {
  labTestingDetails: LabTestingDetail[];
  onSpotDetails: Detail[];
  samplingStatus: number;
  samplingStatusDesc: string;
}

export interface LabTestingDetail {
  diseaseCd: number;
  diseaseCdDesc: string;
  sampleCollectedDate: string;
  sampleExaminationDetails: Detail[];
  sampleId: string;
  sampleType: number;
  sampleTypeDesc: string;
}

export interface Detail {
  courierId: number;
  diseaseCd: number;
  diseaseDesc: string;
  finalSampleResultValue: string;
  followUpNo: number;
  initialSampleResultValue: string;
  labCd: number;
  labCharges: number;
  modeOfTransport: number;
  modeOfTransportDesc: string;
  onSpotTestCd: number;
  onSpotTestDesc: string;
  poolNoOfAnimals: number;
  receiptNo: string;
  runSeqNo: number;
  sampleBarCd: string;
  sampleCollectionDate: string;
  sampleExaminationSubtypeCd: number;
  sampleExaminationSubtypeCdDesc: string;
  sampleExaminationTypeCd: number;
  sampleExaminationTypeCdDesc: string;
  sampleId: string;
  sampleReport: string;
  sampleResult: number;
  sampleResultDesc: string;
  sampleResultRecievedDate: string;
  sampleType: number;
  sampleTypeDesc: string;
  samplingStatus: number;
  samplingStatusDesc: string;
  sourceOriginCd: number;
  sourceOriginId: number;
  testImageUrl1: string;
  testImageUrl2: string;
  testRemarks: string;
  testingLocation: number;
  testingLocationDesc: string;
}

export interface SurgeryPerformedDetail {
  caseId: number;
  followUpNo: number;
  surgeryTypeOrganCd: number;
  surgeryTypeOrganFlag: number;
}

export interface SymptomDetails {
  followUpNo: number;
  originId: number;
  otherSymptom: string;
  remarks: string;
  runSeqNo: number;
  sourceOriginCd: number;
  symptomCd: number;
  name?: string;
  remark?: string;
  symptomDesc:string
}

export interface TreatmentDetails {
  ailmentCd: number;
  animalId: number;
  bodyTemperatureF: number;
  campaignId: number;
  caseId: number;
  caseStatus: number;
  firstAidTreatmentGiven: string;
  followUpDate: string;
  followUpNo: number;
  mobileNo: number;
  ownerId: number;
  paymentAmount: number;
  prescriptionRemarks: string;
  pulseRate: number;
  receiptNo: string;
  recommendedHospitalCd: number;
  recommendedVetName: string;
  respiration: number;
  rumenMotility: number;
  surgeryDate: string;
  surgeryDetails: string;
  surgeryNeededFlag: number;
  surgeryReason: string;
  tagId: number;
  totalMedicineQtyGiven: number;
  totalMedicineQtyPrescribed: number;
  treatmentDate: string;
  treatmentRecordDate: string;
  treatmentRemarks: string;
  treatmentType: number;
}
