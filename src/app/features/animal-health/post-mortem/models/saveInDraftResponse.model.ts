export interface SaveInDraftResponse {
  userId: string;
  animalId: number;
  subModuleCd: string;
  tagId: number;
  creationDate: Date;
  lastUpdateDate: Date;
  draftJson: any;
  draftId: number;
}
