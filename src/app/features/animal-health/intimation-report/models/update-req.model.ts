export interface UpdateReq {
  symptomDetail: Detail[];
  diseaseDetail: Detail[];
  areaMappingDetails: AreaMappingDetail[];
  speciesImpacted: SpeciesImpacted[];
  affectedAnimals: AffectedAnimal[];
  intimationId: number;
  firstIntimationReportingDate: string;
  firstIntimationDate: string;
  reportedBy: string;
  remarks: string;
}

export interface AffectedAnimal {
  animalId: number;
  tagId: number;
}

export interface AreaMappingDetail {
  districtCd: number;
  tehsilCd: number;
  villageCd: number;
}

export interface Detail {
  remarks: string;
  diseaseCd?: number;
  otherDisease?: string;
  symptomCd?: number;
  otherSymptom?: string;
}

export interface SpeciesImpacted {
  speciesCd: number;
  noOfAnimals: number;
  noOfAnimalsDied: number;
}
