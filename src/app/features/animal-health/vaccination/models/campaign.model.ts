
export interface Campaign {
    campaignId:               number;
    campaignName:             string;
    campaignEndDate:          string;
    campaignStartDate:        string;
    vaccineCd:                number;
    vaccineName:              string;
    manufacturer:             string;
    batchNumber:              string;
    diseaseCd:                number;
    diseaseDesc:              string;
    campaignDataEntryEndDate: string;
    vaccineTypeCd:            number | null;
    vaccineSubtypeCd:         number | null;
    formCd:                   number | null;
    routeCd:                  number | null;
    dosage:                   number | null;
    unitCd:                   number | null;
    speciesImpactedEntity:    SpeciesImpactedEntity[];
}

export interface SpeciesImpactedEntity {
    runSeqNo:        number;
    sourceOriginId:  number;
    interimReportNo: number;
    sourceOriginCd:  number;
    speciesCd:       number;
    noOfAnimals:     number;
    noOfAnimalsDied: number;
    isLatest:        string;
    modifiedBy:      string;
    createdBy:       string;
}
