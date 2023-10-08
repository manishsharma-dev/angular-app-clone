

export interface ViewCampaign {
  viewCampaignDetailDto: ViewCampaignDetailDto;
  locationDetailsResponseDto: LocationDetailsResponseDto[];
  speciesEditable: boolean;
  speciesImpactedEntity: SpeciesImpactedEntity[];
}

export interface LocationDetailsResponseDto {
  villageName: string;
  tehsilName: string;
  districtName: string;
}

export interface SpeciesImpactedEntity {
  speciesCd?: string;
  species: string;
  formCd?: string
  form: string;
  routeCd?: string;
  route: string;
  unitCd?: string;
  unit: string;
  dosage: number;
}

export interface ViewCampaignDetailDto {
  campaignId: number;
  campaignName: string;
  campaignStartDate: string;
  campaignEndDate: string;
  campaignDataEntryEndDate: string;
  projectId: string;
  projectName: string;
  campaignCreatorId: string;
  manufacturer: string;
  batchNumber: string;
  vaccineName: string;
  diseaseDesc: string;
  vaccineType: string;
  vaccineSubtypeName: string;
  campaignStatus: string;
  campaignType: string;
  medicineName: string;
  dewormerContent: string;
  vaccinationType?: string;
  saltDesc?: string;
}
