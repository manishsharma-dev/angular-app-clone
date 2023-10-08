export interface SaveGmRes {
  gmId: number;
  projectId: string;
  animalId: number;
  tagId: number;
  gmRecordDate: string;
  gmDate: string;
  length: number;
  girth: number;
  weight: number;
  growthRate: number;
  modifiedDate: string;
  modifiedBy: string;
  creationDate: string;
  createdBy: string;
  roleCd: string;
  isMigrated: string;
  targetedWeeks: string;
  tragetedGrowthRate18Months: string;
  tragetedGrowthRate24Months: string;
  targetedGrowthRate18Months: string;
  targetedGrowthRate24Months: string;
}
