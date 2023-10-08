export interface PrescriptionRes {
  medicineDetails: MedicineDetail[];
  prescriptionDetails: PrescriptionDetails;
  sampleDetails: SampleDetail[];
}

export interface MedicineDetail {
  dose: string;
  form: string;
  medicineDuration: number;
  medicineFrequency: number;
  medicineName: string;
  medicinePrescribedOnlyFlag: string;
}

export interface PrescriptionDetails {
  caseId: number;
  caseStatus: string;
  dateOfBirth: string;
  disease: string;
  district: string;
  followUpDate: string;
  ownerMobileNo: number;
  ownerName: string;
  pulseRate: number;
  registrationNo: string;
  respiration: number;
  rumenMotility: number;
  sex: string;
  species: string;
  symptom: string;
  tagId: number;
  temperature: number;
  treatmentDate: string;
  treatmentRemarks: string;
  vetName: string;
  village: string;
  orgId?: string;
  orgName?: string;
  orgType?: string;
  orgDistrictName?: string;
  orgStateName?: string;
  orgMobileNo?: string;
  roleDesc? : string;
}

export interface SampleDetail {
  sampleId: string;
  sampleResult: string;
  sampleType: string;
  testingLocation: string;
  finalSampleResultValue: string;
}
