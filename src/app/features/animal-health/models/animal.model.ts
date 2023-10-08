export interface AnimalDetails {
  animalId: number;
  ownerDetails: OwnerDetails;
  animalName: string;
  animalPicUrl: string;
  ageInMonths?: number;
  ageInDays?: number;
  animalStatusCd: number;
  animalStatus: string;
  breedAndExoticLevels?: BreedAndExoticLevel[];
  dateOfBirth: string;
  isLoanOnAnimal: boolean;
  ownerId: number;
  registrationDate: string;
  registrationStatus: string;
  sex: string;
  sireId?: number;
  speciesCd: number;
  species: string;
  tagId: number;
  taggingDate: string;
  pregnancyStatus: string;
  fieldSubmittedforUpdate?: string;
  imagePreviewUrl: string;
  numberCalvings?: string;
  damSireId?: string;
  damId?: string;
  sireSireId?: string;
  sireIdText?: string;
  sireSireIdText?: string;
  damIdText?: string;
  damsireIdText?: string;
  pregnancyMonth?: string;
  coatColourCd?: number;
  milkingStatus?: string;
  currentLactationNo: string;
  isElite?: boolean;
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
  ownerAddressStateCd: number;
  ownerStateName: string;
  ownerAddressDistrictCd: number;
  ownerDistrictName: string;
  ownerAddressCityVillageCd: number;
  ownerVillageName: string;
  ownerAddressTehsilCd: number;
  affiliatedAgencyUnionOrPc: boolean;
  registrationStatus: string;
  modifiedDate: string;
  modifiedBy: string;
  createdBy: string;
  creationDate: string;
  isOwnerMobileVerified: boolean;
  orgType?: any;
}
