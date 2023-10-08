export interface PDHistorytModel {
  loc_no: string | number;
  ai_et_date: string;
  bull_id: string;
  pd_date: string;
  calving_date: string;
  ai_type: string;
  serviceType: string;
  status: string;
  actual_heat_no: string;
};

export interface CommonDetail {
  serviceType: [];
  pdResult: [];
};

export interface HistoryDetail {
  animalResponse: [] | null;
  breedingHistoryList: AnimalHistory[] | null;
}

export interface AnimalHistory {
  aiLactationNumber: string | null;
  aiDate: string | null;
  bullId: string | null;
  pdDate: string;
  calvingDate: string;
  aiType: string | null;
  serviceType: string | null;
  status: string;
  actualAiNumber: string;
}
export interface PDDetails {
  compDetail: string | null;
  newPageUrl: string | null;
  apiUrl: string | null,
  apiType: string | null,
  isBreed:boolean|null
}
export interface CommonMasterDetails {
  cd: number;
  key: string;
  message: string;
  status: string;
  value: string;
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
}
