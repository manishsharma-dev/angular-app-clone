export interface CompleteOwnerDetails {
  aadhaarNumber?: string;
  ownerType?: number;
  ownerTypeCd?: number;
  panNumber?: string;
  ownerId: string;
  animalsCount?: number;
  animalsList?: AnimalRegistrationList[];
  ownerName: string;
  ownerFirstName: string;
  ownerMiddleName?: string;
  ownerLastName: string;
  fatherName?: string;
  emailId?: string;
  ownerDateOfbirth?: string;
  dateOfIncorporation?: string;
  ownerTypeCategoryCd?: string;
  ownerTypeCategory?: string;
  ownerGender: string;
  ownerMobileNo: number;
  ownerAddress?: string;
  ownerAddressPincode: number;
  ownerAddressStateCd: number;
  ownerStateName: string;
  ownerAddressDistrictCd: number;
  ownerDistrictName: string;
  ownerAddressCityVillageCd: number;
  ownerVillageName: string;
  ownerAddressHamletCd: number;
  ownerAddressTehsilCd: number;
  ownerTehsilName: string;
  affiliatedAgencyUnionOrPc: boolean;
  registrationStatus: string;
  villageInstitutionType: number;
  villageInstitutionCode: number;
  membershipNumber: string;
  alternateMobileNo: number;
  ownerCastCategoryCd: number;
  ownerLandHoldingCd: number;
  isPourerMember: boolean;
  isOwnerBelowPovertyLine: boolean;
  isCategoryVerified: boolean;
  hhid: string;
  isOwnerMobileVerified: boolean;
  orgId: string;
  orgDistrictCd: number;
  orgAddress: string;
  orgMobileNo?: string;
  orgName: string;
  orgPin: number;
  orgRegistrationNo: number;
  orgType: number;
  orgStateCd: number;
  orgDistrictCdAreaOperating: string;
  districtNameAreaOperating: string;
  orgTypeDesc: string;
  // ownerName: string;
  // fatherName: string;
  // aadhaarNumber: string;
  // ownerDateOfbirth:string;
  ownerDateOfBirth?: string;
}
export interface AnimalRegistrationList {
  animalId: number;
  animalName: string;
  ageInMonths: number;
  animalStatusCd: number;
  animalStatus: string;
  dateOfBirth: string;
  ownerId: string;
  registrationDate: string;
  registrationStatus: string;
  sex: string;
  isLoanOnAnimal: boolean;
  speciesCd: number;
  species: string;
  tagId: string;
  taggingDate?: string;
  fieldSubmittedforUpdate?: string;
  animalCategory?: string;
}
