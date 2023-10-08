export interface EarTagPayload {
  tagEffectiveFrom: string;
  reasonForChange: string;
  tagId: string;
  animalId: number;
  locationInfo?: LocationInfo;
}

export interface LocationInfo {
  userId: number;
  latitude: string;
  longitude: string;
  roleCd: number;
  projectId: number;
  subModuleCd: number;
  villageCd: number;
}
