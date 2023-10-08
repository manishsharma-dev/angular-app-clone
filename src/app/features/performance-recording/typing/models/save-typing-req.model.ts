export interface SaveTypingReq {
  currentLactationNo: number;
  recordDate: string;
  typingDate: string;
  animalTypingTraitsList: AnimalTypingTraitsList[];
  typingRecordDate: string;
  projectId: string;
  animalId: number;
  tagId: number;
}

export interface AnimalTypingTraitsList {
  isMigrated: string;
  typingTrait: number;
  typingTraitValue: null;
  label: string;
  measurementUnitDesc:string
}
