export interface StatusReport {
  animalDetails: AnimalDetails;
  transactions: Transaction[];
}

export interface AnimalDetails {
  animalId: number;
  tagId: number;
  species: string;
  sex: string;
  dateOfBirth: string;
  age: string;
}

export interface Transaction {
  transactionData?: AnimalTransactions;
}

export interface AnimalTransactions {
  date: string;
  service: string;
  data: object;
  serviceCd: number;
}
