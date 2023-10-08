export interface AnimalHistory {
  animalDetails: AnimalDetails;
  vaccinationDetailsHistory: any[];
  treatmentHistoryDetailsHistory: TreatmentHistoryDetailsHistory[];
  dewormerDetailsHistory: any[];
  diseaseTestingHistory: any[];
  firstAidHistory: any[];
}

export interface AnimalDetails {
  animalId: number;
  tagId: number;
  species: string;
  sex: string;
  dateOfBirth: string;
}

export interface TreatmentHistoryDetailsHistory {
  caseId: number;
  cd: number;
  value: string;
  followUpNo: number;
  followUpDate: string;
  disease: string;
  historyDate: string;
}
