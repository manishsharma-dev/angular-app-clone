export interface OwnerDetails {
    ownerId: string;
    animalsList?: AnimalRegistrationList[];
    ownerName: string;
    ownerFirstName: string;
    ownerMiddleName?: string;
    ownerLastName: string;
    fatherName: string;
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
    tagId:number;
    currentLactationNo:number;
    ownerTypeCd?:number,
    ownerType?:number
  
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

  export interface HistoryDetail {
    animalResponse: [] | null;
    breedingHistoryList: AnimalHistory [] | null;
  }

  export interface AnimalHistory {
    aiLactationNumber: string | null;
    aiDate: string | null;
    bullId: string | null;
    pdDate: string;
    calvingDate: string;
    aiType: string | null ;
    status: string;
    actualAiNumber: string;
  }
  export interface AdditionInfo {
    title:string
    lactationNo: string | null;
    animal_id: number | null;
    tagId: number | null;
    isBreedingActivity: boolean;
  }
  export interface AdditionDetails {
    title:string
    animalId: number | null;
    breedingStatus: number| null,
    currentLactationNo: string | null,
    milkingStatus: string | null,
    pregnancyStatus: string | null,
    aiPregnancyReason:number | null
  }

  export interface OwnerData {
    ownerId: string;
    ownerUuidKey1: string | null;
    ownerUuidKey2: string | null;
    ownerFirstName: string;
    ownerLastName: string;
    ownerMiddleName: string | null ;
    fatherFirstName: string;
    fatherMiddleName: string;
    fatherLastName: string;
    ownerDateOfbirth: string;
    ownerGender: string;
    ownerMobileNo: number;
    ownerAddressPincode: number;
    ownerAddressStateCd: number;
    ownerAddressDistrictCd: number;
    ownerAddressCityVillageCd: number;
    villageName: string;
    ownerAddressHamletCd: number;
    affiliatedAgencyUnionOrPc?: boolean;
    registrationStatus: string;
    ownerName?: string;
  }

  