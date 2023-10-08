export interface IntimationReportDetails {
  intimationReport: IntimationReport;
  symptomDetails: SymptomDetail[];
  diseaseDetails: DiseaseDetail[];
  areaMappingDetails: AreaMappingDetail[];
  speciesImpacted: SpeciesImpacted[];
  affectedAnimals: AffectedAnimal[];
  intimationReportSymptomDetails: IntimationReportSymptomDetail[];
  intimationReportAreaMappingDetailsDesc: IntimationReportAreaMappingDetailsDesc[];
  intimationReportDiseaseDetails: IntimationReportDiseaseDetail[];
  intimationReportSpeciesImpacted: IntimationReportSpeciesImpacted[];
}

export interface AffectedAnimal {
  intimationId: number;
  animalId: number;
  tagId: number;
  modifiedBy: string;
  createdBy: string;
  islatest: string;
}

export interface AreaMappingDetail {
  runSeqNo: number;
  sourceOriginId: number;
  sourceOriginCd: number;
  districtCd: number;
  tehsilCd: number;
  villageCd: number;
  isLatest: string;
  modifiedBy: string;
  createdBy: string;
}

export interface DiseaseDetail {
  originId: number;
  followUpNo: number;
  runSeqNo: number;
  remarks: string;
  sourceOriginCd: number;
  diseaseCd: number;
  otherDisease: string;
  modifiedBy: string;
  createdBy: string;
}

export interface IntimationReport {
  intimationId: number;
  firstIntimationDate: string;
  firstIntimationReportingDate: string;
  reportedBy: string;
  remarks: string;
  firId: null;
  firCreationDate: null;
  modifiedBy: string;
  createdBy: string;
}

export interface IntimationReportAreaMappingDetailsDesc {
  districtCd: number;
  districtName: string;
  tehsilCd: number;
  tehsilName: string;
  villageCd: number;
  villageName: string;
  runSeqNo: number;
}

export interface IntimationReportDiseaseDetail {
  diseaseCd: number;
  diseaseDesc: string;
}

export interface IntimationReportSpeciesImpacted {
  speciesCd: number;
  speciesName: string;
}

export interface IntimationReportSymptomDetail {
  symptomCd: number;
  symptomDesc: string;
}

export interface SpeciesImpacted {
  runSeqNo: number;
  sourceOriginId: number;
  interimReportNo: number;
  sourceOriginCd: number;
  speciesCd: number;
  noOfAnimals: number | null;
  noOfAnimalsDied: number | null;
  isLatest: string;
  modifiedBy: string;
  createdBy: string;
}

export interface SymptomDetail {
  originId: number;
  remarks: string;
  symptomCd: number;
  otherSymptom: string;
  modifiedBy: string;
  createdBy: string;
}
