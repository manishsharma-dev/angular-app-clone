export interface OwnerDetails {
    ownerId: string;
    animalsList?: AnimalRegistrationList[];
    ownerFirstName: string;
    ownerMiddleName?: string;
    ownerLastName: string;
    fatherFirstName: string;
    fatherMiddleName?: string;
    fatherLastName: string;
    emailId?: string;
    ownerDateOfbirth: string;
    ownerGender: string;
    ownerMobileNo: number;
    ownerAddress?: string;
    ownerAddressPincode: number;
    ownerAddressStateCd: number;
    ownerAddressDistrictCd: number;
    ownerAddressCityVillageCd: number;
    ownerVillageName: string;
    ownerAddressHamletCd: number;
    ownerAddressTehsilCd: number;
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
  }
  export interface AnimalRegistrationList {
    animalId: number;
    animalName: string;
    animalStatusCd: number;
    animalStatus: string;
    ownerId: string;
    speciesCd: number;
    species: string;
    tagId: string;
    taggingDate: string;
    age:string;
    breed1:string;
    isElite:boolean;
    milkingStatus:string;
    pregnancyStatus:string;
    lactationNo:string;
  }
  