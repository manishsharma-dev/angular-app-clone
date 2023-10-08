export interface AdditionalDetailsFormObj {
  parameters: Parameter[];
  dateGroup: DateGroup;
  semenDetails: Details;
  sireDetails: Details;
  damDetails: DamDetails;
  sireSireDetails: Details;
  sireDamDetails: DamDetails;
  damSireDetails: Details;
  damDamDetails: DamDetails;
}

export interface DamDetails {
  standardYield: PurpleFatPercentage;
  fatPercentage: PurpleFatPercentage;
  fatYield: PurpleFatPercentage;
  proteinPercentage: PurpleFatPercentage;
  proteinYield: PurpleFatPercentage;
  lactosePercentage: PurpleFatPercentage;
  lactoseYield: PurpleFatPercentage;
  scc: PurpleFatPercentage;
  mun: PurpleFatPercentage;
  dateGroup: DateGroup;
}

export interface DateGroup {
  estimationDate: Date | string;
  noOfDaughters: string;
  noOfVillages: string;
  bullId: string;
  sireId: string;
  damId: string;
}

export interface PurpleFatPercentage {
  lactations: string[];
  breedingValue: string;
}

export interface Details {
  standardYield: FluffyFatPercentage;
  fatPercentage: FluffyFatPercentage;
  fatYield: FluffyFatPercentage;
  proteinPercentage: FluffyFatPercentage;
  proteinYield: FluffyFatPercentage;
  lactosePercentage: FluffyFatPercentage;
  lactoseYield: FluffyFatPercentage;
  scc: FluffyFatPercentage;
  mun: FluffyFatPercentage;
  dateGroup?: DateGroup;
}

export interface FluffyFatPercentage {
  avgValue: string;
  breedingValue: string;
  reliability: string;
}

export interface Parameter {
  avgAbsoluteValue: string;
  breedingValue: string;
  reliability: string;
}
