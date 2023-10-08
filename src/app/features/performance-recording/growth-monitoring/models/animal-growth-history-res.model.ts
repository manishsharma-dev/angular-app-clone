export interface GrowthHistoryRes {
  animalResponse: AnimalResponse;
  animalGrowthResponseList: AnimalGrowthResponseList[];
}

export interface AnimalGrowthResponseList {
  gmDate: string;
  length: string;
  girth: string;
  weight: string;
  growthRate: string;
}

export interface AnimalResponse {
  animalId: number;
  animalName: string;
  animalPicUrl: string;
  ageInMonths: number;
  animalStatusCd: number;
  animalStatus: string;
  breedAndExoticLevels: BreedAndExoticLevel[];
  coatColourCd: number;
  dateOfBirth: string;
  isLoanOnAnimal: boolean;
  lastDewormingDate: string;
  ownerId: number;
  registrationDate: string;
  registrationStatus: string;
  sex: string;
  speciesCd: number;
  species: string;
  tagId: number;
  taggingDate: string;
  milkingStatus: string;
  numberCalvings: number;
  pregnancyMonth: number;
  pregnancyStatus: string;
  imagePreviewUrl: string;
  age: string;
  breed: string;
}

export interface BreedAndExoticLevel {
  breed: string;
  bloodExoticLevel: string;
}
