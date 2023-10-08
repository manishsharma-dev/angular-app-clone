export interface CalvingCommonDetail {
    calvingStatus:CaseStatus[] ;
    calvingEase:CaseStatus[] ;
    numberOfCalves:CaseStatus[] ;
    geneticDefects:CaseStatus[] ;
    reasonForNotRegister:CaseStatus[] ;
    serviceType:any ;
  };
  
  export interface CaseStatus {
    key: string;
    cd: number;
    value: string;
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
    serviceType: string | null ;
    status: string;
    actualAiNumber: string;
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

  export interface CommonMasterDetails {
    cd: number;
    key: string;
    message: string;
    status: string;
    value: string;
  }