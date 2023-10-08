export interface Breed {
    speciesCd: number;
    breedCd: number;
    breedName: string;
  }
  export interface BullList {
    bullMasterDtoList:bullDetail[];
    subOrganizationDetailsResponceDto:{}
   
  }

  export interface bullDetail {
    bullId: string;
    tagId: number;
    bullRegistrationDate: string;
    bullRegistrationRecordDate:string;
    species:string;
    breed:string;
    dateOfBirth:string;
    nominatedBullFlag:string;
    importedSemenFlag:string
    animalStatus:string
    bullStatus:number
    etBullFlag:string;
    sexSortedFlag:string;
    semenStationId:number;
    bullTypeFlag:string
  }
  export interface AnimalDetailList {
   animalList:AnimalDetail

  }
  
  export interface AnimalDetail {
    age: string
    animalId:number
    animalStatus:string
    animalStatusCd:string
    dateOfBirth:string
    isLoanOnAnimal:boolean
    milkingStatus:string
    pregnancyStatus:string
    species:string
    speciesCd:string
    breedAndExoticLevels:breedLevels[]
    damId:number;
    sireId:number;

  }

  export interface breedLevels{
    breed:string;
    bloodExoticLevel:string;
  }

  export interface OrgList {
    S_No: number;
    Org_Name: string;
    Org_Address: string;
    Reg_no: string;
    orgId: number;
    orgName: string;
    orgType: number;
    subOrgId:number;
    districtName:string
    parentOrganization:string
    stateName:string
    subOrgName:string
    uin:string;
    subOrgType:number;
    subOrgStatus:number

  }
  
  