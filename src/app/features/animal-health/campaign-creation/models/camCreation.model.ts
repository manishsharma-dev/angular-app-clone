

export interface SaveCamCreation {
  areaMappingDetails: AreaMappingDetail[];
  batchNumber: string;
  campaignCreatorId: string;
  campaignEndDate: string;
  campaignName: string;
  campaignRegistrationStatus: number;
  campaignStartDate: string;
  campaignStatus: number;
  campaignType: number;
  campaigndataEntryEndDate: string;
  createdBy: string;
  dewormerCd: number;
  diseaseCd: number;
  manufacturer: string;
  modifiedBy: string;
  projectId: string;
  speciesImpactedEntity: SpeciesImpactedEntity[];
  vaccinationType: number;
  vaccineCd: number;
  vaccineSubtypeCd: number;
  vaccineTypeCd: number;
}

export interface AreaMappingDetail {
  createdBy: string;
  districtCd: number;
  isLatest: string;
  modifiedBy: string;
  sourceOriginCd: number;
  tehsilCd: number;
  villageCd: number;
}

export interface SpeciesImpactedEntity {
  createdBy: string;
  dosage: number;
  formCd: number;
  interimReportNo: number;
  isLatest: string;
  modifiedBy: string;
  noOfAnimals: number;
  noOfAnimalsDied: number;
  routeCd: number;
  sourceOriginCd: number;
  speciesCd: number;
  unitCd: number;
}


export interface CampaignMaster {
  campaignId: number
  campaignName: string
  campaignStartDate: string
  campaignEndDate: string
  campaignDataEntryEndDate: string
  projectId: string
  villageNames: string
  districtName: string
  campaignStatusId: number
  campaignStatus: string
  campaignTypeId: number
  campaignType: string
}
