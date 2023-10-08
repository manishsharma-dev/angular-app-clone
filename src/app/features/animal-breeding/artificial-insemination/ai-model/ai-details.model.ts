export interface AIData {
    ownerId: string;
    ownerUuidKey1: string | null;
    ownerUuidKey2: string | null;
    ownerFirstName: string;
    ownerLastName: string;
    ownerMiddleName: string | null ;
    fatherFirstName: string;
    fatherMiddleName: string;
    fatherLastName: string;
    ownerDateOfBirth: string;
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
    animalsList:any;
    animalsCount:any;
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

  export interface AICommonDetail {
    aiType:CaseStatus[] ;
    carvicalMucus:CaseStatus[]
    micturition:CaseStatus[]
    mountingHerd:CaseStatus[]
    standingMounted:CaseStatus[]
    swollenVulva:CaseStatus[]
    vocalization:CaseStatus[],
    semenType:CaseStatus[]
  };
  export interface CaseStatus {
    key: string;
    cd: number;
    value: string;
  }
  export interface AIDetails {
    compDetail: string | null;
    newPageUrl: string | null;
    apiUrl:string | null,
    apiType:string | null
  }

  export interface animalDetails {
    age: string;
    ageInMonths: number
    animalId: number
    animalName: string
    animalStatus: string
    animalStatusCd: 5
    breed: string
    coatColourCd: 1
    currentLactationNo: 8
    dateOfBirth: string
    isLoanOnAnimal: boolean
    milkingStatus: string
    numberCalvings: number
    ownerId: number
    pregnancyMonth: number
    pregnancyStatus: string
    registrationDate: string
    registrationStatus: string
    sex: string
    species: string
    speciesCd: number
    tagId: number
    taggingDate: string
    isElite:string
    villageCd:number
  }
