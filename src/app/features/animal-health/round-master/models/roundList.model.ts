

export interface RoundList {
    roundNo:          number;
    stateCd:          number;
    stateName:        StateName;
    diseaseCd:        number;
    diseaseDesc:      DiseaseDesc;
    fromDate:         string;
    toDate:           string;
    dataEntryEndDate: string;
    remarks:          string;
}

export enum DiseaseDesc {
    Brucellosis = "Brucellosis",
    FootAndMouthDiseaseFMD = "Foot and Mouth Disease(FMD)",
}

export enum StateName {
    Haryana = "HARYANA",
    JammuAndKashmir = "JAMMU AND KASHMIR",
}
