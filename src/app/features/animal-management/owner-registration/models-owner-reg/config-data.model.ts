export interface ConfigData {
  locationInfoObj: Geolocations;
  aadharLength?: AadharLength;
  adminmoduleOrgReg?: ConfigValues;
  minAgeForPregnancy?: ConfigValues;
  ownerAddress?: ConfigValues;
  ownerNameLength?: ConfigValues;
  ownerAge?: ConfigValues;
  animalDOBLimit?: ConfigValues;
  taggingDateLimit?: ConfigValues;
  ownershipTransferDateLimit?: ConfigValues;
  earTagChangeDateLimit?: ConfigValues;
  animalDeathDateLimit?: ConfigValues;
}

export interface AadharLength {
  key: string;
  defaultValue: string;
}

export interface Geolocations {
  userId: string;
  latitude: string;
  longitude: string;
  roleCd: number;
  projectId: number;
  subModuleCd: number;
  villageCd: number;
}

export interface ConfigValues {
  key?: string;
  defaultValue?: string;
  rangeUpperValue?: number;
  rangeLowerValue?: number;
}
