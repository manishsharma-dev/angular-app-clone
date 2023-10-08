export type SampleStatusFlag = 'A' | 'D' | 'B' | 'O';

export interface SampleType {
  sampleTypeCd: number;
  sampleTypeDesc: string;
  statusFlag: SampleStatusFlag;
}

export interface SampleExaminationType {
  sampleExaminationTypeCd: number;
  sampleExaminationTypeDesc: string;
}

export interface Medicine {
  medicineCd: number;
  saltCd1: number;
  saltCd2: number;
  saltCd3: number;
  medicineName: string;
  medicineTypeCd: number;
  medicineFormCd: number;
  medicineRouteCd: number;
  medicineUnitCd: number;
  dewormerFlg: string;
  manufacturer: string;
  batchNumber: string;
  stockQty: string;
  modifiedDate: string;
  modifiedBy: string;
  creationDate: string;
  createdBy: string;
}

export interface DiagnosticData {
  onSpotTesting: string;
  sampleforLabTesting: string;
  spotTestingRows: SpotTestingRow[];

  samples: {
    sampleId?: string;
    diseaseSuspected: number;
    sampleType: number;
    sampleExaminationDetails: LabTestingRow[];
  }[];
  diagnosticsData: boolean[];
  diagnosticsDataDetails: any[];
}

export interface LabTestingRow {
  testRemarks: string;
  diseaseCd: string;
  sampleType: number | string;
  sampleExaminationTypeCd: number | string;
  sampleExaminationSubtypeCd: number | string;
  labCd: string;
  labCharges: string;
  receiptNo: string;
  modeOfTransport: string;
  sampleTypeName?: string;
  typeOfExamName?: string;
  examsubTypeName?: string;
  isUpdate?: boolean;
  sampleId?: string;
}

export interface SpotTestingRow {
  onSpotTestCd: number | string;
  sampleType: number | string;
  initialReading: string;
  finalReading: string;
  difference: string;
  sampleResult: string;
  onSpotTestCdName?: string;
  sampleTypeName?: string;
  diseaseSuspected: string;
  isUpdate?: boolean;
  sampleId?: string;
  samplingStatus: number;
}

export interface suggestedMedicineModel {
  medicineCd: string | null;
  medicineName: string;
  form: string;
  medicineFormCd?: number | any;
  route: string;
  unit: number | null;
  dose: number | null;
  freq_day: number | null;
  duration: number | null;
  medicine_pres_only: boolean;
  remark?: string | null;
}

export interface MedicineListModel {
  medicine_name: string;
  form: string;
  route: string;
  unit: string;
  dose: string;
  freq_day: string;
  duration: string;
  presribedOnly: boolean;
}

export interface diagnosticsModel {
  diagnosticsType: string;
  sampleType: string;
}

export interface TreatmentHistoryModel {
  caseID: string;
  treatmentDate: string;
  diagnosticDescription: string;
  vetName: String;
  diagnostics: string;
  prescription: string;
  noOfVisits: number;
  list: any[];
}

export interface Surgery {
  surgeryTypeCd: number;
  createdBy: string;
  creationDate: string;
  effectiveFromDate: string;
  effectiveToDate: string;
  isActive: string;
  modifiedBy: string;
  modifiedDate: string;
  organCd1: number;
  organCd2: number;
  organCd3: number;
  surgeryTypeDesc: string;
}

export interface OrganAffected {
  organCd: number;
  createdBy: string;
  creationDate: string;
  effectiveFromDate: string;
  effectiveToDate: string;
  isActive: string;
  modifiedBy: string;
  modifiedDate: string;
  organDesc: string;
}

export interface SpotTestMaster {
  onSpotTestCd: number;
  diseaseCd: number;
  onSpotTestDesc: string;
  sampleTypeCd?: string;
  sampleTypeDesc?: string;
}

export interface SampleExaminationSubtypeMaster {
  sampleExaminationSubtypeCd: number;
  sampleExaminationSubtypeDesc: string;
  sampleExaminationTypeCd: number;
}

export interface AnimalMasterList {
  animalId: number;
  ownerDetails?: OwnerDetails;
  breedAndExoticLevels?: BreedAndExoticLevel[];
  animalName: string;
  animalPicUrl: string;
  ageInMonths: number;
  animalStatusCd: number;
  animalStatus: string;
  coatColourCd: number;
  dateOfBirth: string;
  isLoanOnAnimal: boolean;
  ownerId: number;
  registrationDate: string;
  registrationStatus: string;
  sex: string;
  speciesCd: number;
  species: string;
  tagId: number;
  taggingDate: string;
  milkingStatus: string;
  pregnancyStatus: string;
  imagePreviewUrl: string;
  isElite: boolean
}

export interface BreedAndExoticLevel {
  breed: string;
  bloodExoticLevel: string;
}

export interface OwnerDetails {
  ownerId: number;
  ownerUuidKey1: string;
  ownerUuidKey2: string;
  ownerName: string;
  fatherName: string;
  ownerDateOfbirth: string;
  ownerGender: string;
  ownerMobileNo: number;
  emailId: string;
  ownerAddress: string;
  ownerAddressPincode: number;
  ownerAddressStateCd: number;
  ownerStateName: string;
  ownerAddressDistrictCd: number;
  ownerDistrictName: string;
  ownerAddressCityVillageCd: number;
  ownerVillageName: string;
  ownerAddressTehsilCd: number;
  ownerTehsilName: string;
  affiliatedAgencyUnionOrPc: boolean;
  registrationStatus: string;
  modifiedDate: string;
  modifiedBy: string;
  createdBy: string;
  creationDate: string;
  alternateMobileNo: number;
  ownerCastCategoryCd: number;
  ownerLandHoldingCd: number;
  isPourerMember: boolean;
  isOwnerBelowPovertyLine: boolean;
  isCategoryVerified: boolean;
  isOwnerMobileVerified: boolean;
}

export interface LabMaster {
  subOrgId: number;
  orgId: number;
  uin: string;
  parentOrganization: string;
  subOrgName: string;
  subOrgType: number;
  subOrgTypeDesc: string;
  stateCd: number;
  stateName: string;
  districtCd: number;
  districtName: string;
  subOrgStatus: number;
  subOrgStatusDesc: string;
}
