export interface GeneticHistoryRes {
  animalResponse: AnimalResponse;
  animalGeneticResponseList: GeneticHistory[];
}

export interface GeneticHistory {
  sampleId: string;
  sampleRecordDate: string;
  sampleCollectionDate: string;
  breedingSampleTypeName: string;
  breedingExaminationSubtypeName: string;
  labName: null | string;
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
  damId: null;
  damSireId: null;
  dateOfBirth: string;
  isLoanOnAnimal: boolean;
  lastDewormingDate: null;
  lastVaccinationDate: null;
  loanAmount: null;
  muzzlePicUrl: null;
  ownerId: number;
  registrationDate: string;
  registrationRemarks: null;
  registrationStatus: string;
  sex: string;
  sireId: null;
  sireSireId: null;
  speciesCd: number;
  species: string;
  tagId: number;
  taggingDate: string;
  isElite: boolean;
  milkingStatus: string;
  numberCalvings: null;
  pregnancyMonth: number;
  pregnancyStatus: string;
  yieldMilkRecorded: null;
  fieldSubmittedforUpdate: null;
  imagePreviewUrl: string;
  currentLactationNo: number;
  age: string;
  breed: string;
  eligibleForEt: null;
  dryOffDate: string;
  lastCalvingDate: string;
  ageInDays: null;
}

export interface BreedAndExoticLevel {
  breed: string;
  bloodExoticLevel: string;
}
