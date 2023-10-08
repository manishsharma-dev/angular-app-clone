
export interface Campaign {
  campaignId:               number;
  campaignName:             string;
  campaignEndDate:          string;
  campaignStartDate:        string;
  campaignStatus:           string;
  vaccineCd:                null;
  vaccineName:              null;
  batchNumber:              null;
  diseaseCd:                null;
  diseaseDesc:              null;
  manufacturer:             null;
  campaignDataEntryEndDate: string;
  vaccineTypeCd:            null;
  vaccineSubtypeCd:         null;
  campaignType:             number;
  dewormerCd:               number;
  dewormerName:             string;
  speciesImpactedEntity:    any[];
}


export interface SpeciesImpactedEntity {
  runSeqNo: number;
  sourceOriginId: number;
  interimReportNo: number;
  sourceOriginCd: number;
  speciesCd: number;
  noOfAnimals: number;
  noOfAnimalsDied: number;
  isLatest: string;
  modifiedBy: string;
  createdBy: string;
}
