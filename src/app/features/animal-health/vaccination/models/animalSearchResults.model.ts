export interface AnimalSearchResults {
  animalId: number;
  animalName: string;
  ageInMonths: number;
  animalStatusCd: number;
  animalStatus?: string;
  dateOfBirth: string;
  ownerId: string;
  registrationDate: string;
  registrationStatus: string;
  sex: string;
  isLoanOnAnimal: boolean;
  speciesCd: number;
  species: string;
  tagId: string;
  taggingDate: string;
  ownerDetails: OwnerDetails;
  animalPicUrl: string;
  breedAndExoticLevels: BreedAndExoticLevel[];
  coatColourCd: number;
  damId: number;
  damSireId: number;
  sireId: number;
  sireSireId: number;
  numberCalvings: number;
  pregnancyStatus: string;
  fieldSubmittedforUpdate: number;
  imagePreviewUrl: string;
}

export interface BreedAndExoticLevel {
  breed: string;
  bloodExoticLevel: string;
}

export interface OwnerDetails {
  ownerId: string;
  ownerUuidKey1: string;
  ownerFirstName: string;
  ownerMiddleName?: string;
  ownerLastName: string;
  fatherFirstName: string;
  fatherMiddleName?: string;
  fatherLastName: string;
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
  villageInstitutionType: number;
  villageInstitutionCode: number;
  membershipNumber: string;
  ownerAddressPincode: number;
  ownerAddressHamletCd: number;
  registrationStatus: string;
  alternateMobileNo: number;
  ownerCastCategoryCd: number;
  ownerLandHoldingCd: number;
  isPourerMember: boolean;
  isOwnerBelowPovertyLine: boolean;
  isCategoryVerified: boolean;
  hhid: string;
  modifiedDate: string;
  modifiedBy: string;
  createdBy: string;
  creationDate: string;
  isOwnerMobileVerified: boolean;
  orgId: string;
  orgDistrictCd: number;
  orgAddress: string;
  orgName: string;
  orgPin: number;
  orgRegistrationNo: number;
  orgType: number;
  orgStateCd: number;
  orgDistrictCdAreaOperating: string;
}
